"use client"

import { useState, useEffect } from "react"
import {
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material"
import { Add, Remove, Search, Refresh } from "@mui/icons-material"
import { getStockList, makeSale, getPromotionsList, getProductIdByName } from "../services/api"
import SaleInfoDialog from "./SaleInfoDialog"

const MakeSale = () => {
  const [products, setProducts] = useState([])
  const [promotions, setPromotions] = useState([])
  const [cart, setCart] = useState({})
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" })
  const [saleInfoDialog, setSaleInfoDialog] = useState({ open: false, saleInfo: null })
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [productIds, setProductIds] = useState({}) // Cache for product IDs

  useEffect(() => {
    fetchProducts()
    fetchPromotions()
  }, [])

  const fetchProducts = async () => {
    try {
      setRefreshing(true)
      const stockList = await getStockList()
      setProducts(stockList)

      // Update cart to remove products that no longer have stock
      setCart((prevCart) => {
        const newCart = { ...prevCart }
        Object.entries(newCart).forEach(([productId, item]) => {
          const product = stockList.find((p) => p.id === Number.parseInt(productId))
          if (!product || product.cantidad === 0) {
            delete newCart[productId]
          } else if (item.quantity > product.cantidad) {
            newCart[productId] = {
              ...item,
              quantity: product.cantidad,
            }
          }
        })
        return newCart
      })
    } catch (error) {
      setSnackbar({ open: true, message: "Error al obtener los productos", severity: "error" })
    } finally {
      setRefreshing(false)
    }
  }

  const fetchPromotions = async () => {
    try {
      const promotionsList = await getPromotionsList()
      setPromotions(promotionsList)
    } catch (error) {
      console.error("Error al obtener promociones:", error)
    }
  }

  const handleAddToCart = (product) => {
    if (product.cantidad === 0) {
      setSnackbar({ open: true, message: "No hay stock de este producto. ", severity: "warning" })
      return
    }

    const currentQuantity = cart[product.id]?.quantity || 0
    if (currentQuantity < product.cantidad) {
      setCart((prevCart) => ({
        ...prevCart,
        [product.id]: {
          ...product,
          quantity: currentQuantity + 1,
        },
      }))
    } else {
      setSnackbar({ open: true, message: "Se alcanzó el stock máximo disponible", severity: "warning" })
    }
  }

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart }
      if (newCart[productId].quantity > 1) {
        newCart[productId] = {
          ...newCart[productId],
          quantity: newCart[productId].quantity - 1,
        }
      } else {
        delete newCart[productId]
      }
      return newCart
    })
  }

  const handleQuantityChange = (productId, quantity) => {
    const product = products.find((p) => p.id === productId)
    if (!product) {
      setSnackbar({ open: true, message: "Producto no encontrado", severity: "error" })
      return
    }

    if (quantity > 0 && quantity <= product.cantidad) {
      setCart((prevCart) => ({
        ...prevCart,
        [productId]: {
          ...prevCart[productId],
          quantity: quantity,
        },
      }))
    } else if (quantity > product.cantidad) {
      setSnackbar({ open: true, message: "El stock disponible es menor a la cantidad", severity: "warning" })
    }
  }

  const handleSearch = (event) => {
    setSearch(event.target.value)
  }

  const handleSortChange = (event) => {
    setSortBy(event.target.value)
  }

  const filteredAndSortedProducts = products
    .filter((product) => product.producto.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.producto.localeCompare(b.producto)
      } else if (sortBy === "price") {
        return a.precioVenta - b.precioVenta
      } else if (sortBy === "promotion") {
        const aPromo = promotions.find((p) => p.producto === a.producto)
        const bPromo = promotions.find((p) => p.producto === b.producto)
        return (bPromo ? 1 : 0) - (aPromo ? 1 : 0)
      }
      return 0 
    })

  const handleCheckout = async () => {
    try {
      setLoading(true)

      for (const [productId, item] of Object.entries(cart)) {
        const product = products.find((p) => p.id === Number.parseInt(productId))
        if (!product || product.cantidad === 0) {
          setSnackbar({
            open: true,
            message: `Product ${product ? product.producto : productId} está fuera de stock`,
            severity: "error",
          })
          setLoading(false)
          return
        }

        if (item.quantity > product.cantidad) {
          setSnackbar({
            open: true,
            message: `Solo hay ${product.cantidad} unidades de ${product.producto} disponible/s`,
            severity: "error",
          })
          setLoading(false)
          return
        }
      }

      const formattedSaleData = {}
      const cartDetails = {}

      for (const [productId, item] of Object.entries(cart)) {
        try {
          if (!productIds[item.producto]) {
            const realProductId = await getProductIdByName(item.producto)
            setProductIds((prev) => ({ ...prev, [item.producto]: realProductId }))
            formattedSaleData[realProductId] = item.quantity
            cartDetails[realProductId] = {
              producto: item.producto,
              precioVenta: item.precioVenta,
              quantity: item.quantity,
            }
          } else {
            formattedSaleData[productIds[item.producto]] = item.quantity
            cartDetails[productIds[item.producto]] = {
              producto: item.producto,
              precioVenta: item.precioVenta,
              quantity: item.quantity,
            }
          }
        } catch (error) {
          console.error(`Error al obtener el ID del producto real para ${item.producto}:`, error)
          setSnackbar({
            open: true,
            message: `Error al obtener el ID del producto ${item.producto}`,
            severity: "error",
          })
          setLoading(false)
          return
        }
      }

      console.log("Datos de venta antes de la llamada a la API:", JSON.stringify(formattedSaleData, null, 2))
      const result = await makeSale(formattedSaleData)
      console.log("Venta result:", JSON.stringify(result, null, 2))
      console.log("Detalles del carrito:", JSON.stringify(cartDetails, null, 2))

      const saleInfoWithDetails = []
      const transactionId = Math.floor(Math.random() * 1000000)
      const saleDate = new Date().toISOString()

      console.log("Creación de información de venta a partir de la respuesta:", JSON.stringify(result, null, 2))
      console.log("Detalles del carrito:", JSON.stringify(cartDetails, null, 2))

      if (result && Array.isArray(result) && result.length > 0) {
        for (const item of result) {
          const productId = item.productoId || item.id
          const details = cartDetails[productId]
          if (details) {
            saleInfoWithDetails.push({
              id: productId,
              producto: details.producto,
              precioVenta: details.precioVenta,
              cantidadVendida: item.cantidad || details.quantity,
              fechaVenta: saleDate,
              transaccionId: transactionId,
            })
          }
        }
      } else if (result && typeof result === "object" && Object.keys(result).length > 0) {
        for (const [productId, quantity] of Object.entries(result)) {
          const details = cartDetails[productId]
          console.log(`Producto de procesamiento ID ${productId}, detalles:`, details)
          if (details) {
            saleInfoWithDetails.push({
              id: productId,
              producto: details.producto,
              precioVenta: details.precioVenta,
              cantidadVendida: quantity,
              fechaVenta: saleDate,
              transaccionId: transactionId,
            })
          }
        }
      }

      if (saleInfoWithDetails.length === 0) {
        console.log("Crear información de venta desde el carrito en lugar de la respuesta")
        for (const [localProductId, item] of Object.entries(cart)) {
          saleInfoWithDetails.push({
            id: localProductId,
            producto: item.producto,
            precioVenta: item.precioVenta,
            cantidadVendida: item.quantity,
            fechaVenta: saleDate,
            transaccionId: transactionId,
          })
        }
      }

      if (saleInfoWithDetails.length > 0) {
        setSaleInfoDialog({ open: true, saleInfo: saleInfoWithDetails })
        setCart({})
        fetchProducts()
      } else {
        console.error("No se pudo crear información de venta desde la respuesta o el carrito")
        throw new Error("No se pudo crear información de venta desde la respuesta o el carrito")
      }
    } catch (error) {
      console.error("Error al realizar la venta:", error)
      let errorMessage = "Error al realizar la venta"
      if (error.response) {
        console.error("Error response:", JSON.stringify(error.response.data, null, 2))
        errorMessage = error.response.data.message || errorMessage
      } else if (error.request) {
        console.error("No se recibió respuesta:", error.request)
      } else {
        console.error("Error details:", error.message)
      }
      setSnackbar({ open: true, message: errorMessage, severity: "error" })
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    return Object.values(cart).reduce((total, item) => {
      return total + item.precioVenta * item.quantity
    }, 0)
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: "auto", padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        REALIZAR VENTA
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Box sx={{ flexBasis: "60%", marginBottom: 2 }}>
          <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <TextField
                label="Buscar Productos"
                variant="outlined"
                value={search}
                onChange={handleSearch}
                InputAttrs={{
                  startAdornment: <Search />,
                }}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel>Ordenar por</InputLabel>
                  <Select value={sortBy} onChange={handleSortChange} label="Sort By">
                    <MenuItem value="name">Nombre</MenuItem>
                    <MenuItem value="price">Precio</MenuItem>
                    <MenuItem value="promotion">Promocion</MenuItem>
                  </Select>
                </FormControl>
                <IconButton onClick={fetchProducts} disabled={refreshing}>
                  {refreshing ? <CircularProgress size={24} /> : <Refresh />}
                </IconButton>
              </Box>
            </Box>
            <List>
              {filteredAndSortedProducts.map((product) => (
                <ListItem
                  key={product.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="add to cart"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.cantidad === 0}
                    >
                      <Add />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={product.producto}
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          Precio: ${product.precioVenta.toFixed(2)} | Stock: {product.cantidad}
                        </Typography>
                        {product.cantidad === 0 && (
                          <Typography variant="body2" component="span" color="error" sx={{ ml: 1 }}>
                            Fuera de Stock
                          </Typography>
                        )}
                      </>
                    }
                  />
                  {promotions.find((p) => p.producto === product.producto) && (
                    <Typography variant="body2" color="primary">
                      Promoción disponible
                    </Typography>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
        <Box sx={{ flexBasis: "40%", marginBottom: 2 }}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Carrito
            </Typography>
            {Object.keys(cart).length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: "center", my: 4 }}>
                Su carrito está vacío. Agregue productos para continuar con el pago.
              </Typography>
            ) : (
              <List>
                {Object.entries(cart).map(([productId, item]) => (
                  <ListItem key={productId}>
                    <ListItemText
                      primary={item.producto}
                      secondary={`Precio: $${item.precioVenta.toFixed(2)} | Cantidad: ${item.quantity}`}
                    />
                    <Box>
                      <IconButton onClick={() => handleRemoveFromCart(productId)}>
                        <Remove />
                      </IconButton>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(productId, Number.parseInt(e.target.value))}
                        inputAttrs={{ min: 1, max: item.cantidad }}
                        sx={{ width: 60 }}
                      />
                      <IconButton onClick={() => handleAddToCart(item)}>
                        <Add />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
            <Typography variant="h6" align="right">
              Total: ${calculateTotal().toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCheckout}
              disabled={Object.keys(cart).length === 0 || loading}
              sx={{ marginTop: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Checkout"}
            </Button>
          </Paper>
        </Box>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <SaleInfoDialog
        open={saleInfoDialog.open}
        onClose={() => setSaleInfoDialog({ ...saleInfoDialog, open: false })}
        saleInfo={saleInfoDialog.saleInfo}
      />
    </Box>
  )
}

export default MakeSale

