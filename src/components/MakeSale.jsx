"use client"

import { useState, useEffect } from "react"
import { Add, Remove, Refresh } from "@mui/icons-material"
import { getStockList, makeSale, getPromotionsList, getProductIdByName } from "../services/api"
import SaleInfoDialog from "./SaleInfoDialog"
import styles from "../styles/MakeSale.module.css"

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

    const currentQuantity = Number.parseFloat(cart[product.id]?.quantity) || 0
    if (currentQuantity < product.cantidad) {
      setCart((prevCart) => ({
        ...prevCart,
        [product.id]: {
          ...product,
          quantity: (currentQuantity + 1).toString(),
        },
      }))
    } else {
      setSnackbar({ open: true, message: "Se alcanzó el stock máximo disponible", severity: "warning" })
    }
  }

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart }
      const currentQuantity = Number.parseFloat(newCart[productId].quantity) || 0

      if (currentQuantity > 1) {
        newCart[productId] = {
          ...newCart[productId],
          quantity: (currentQuantity - 1).toString(),
        }
      } else {
        delete newCart[productId]
      }
      return newCart
    })
  }

  const handleQuantityChange = (productId, e) => {
    // Get the raw input value
    const inputValue = e.target.value

    // Allow any input that could be part of a valid decimal number
    // This includes empty string, just a decimal point, or numbers with decimals
    setCart((prevCart) => ({
      ...prevCart,
      [productId]: {
        ...prevCart[productId],
        quantity: inputValue, // Store the raw input value as a string
      },
    }))

    // Only validate after the user has entered something
    if (inputValue !== "" && inputValue !== "." && inputValue !== "0.") {
      const quantity = Number.parseFloat(inputValue)
      const product = products.find((p) => p.id === productId)

      // Check if it's a valid number and within stock limits
      if (!isNaN(quantity) && product && quantity > product.cantidad) {
        setSnackbar({
          open: true,
          message: "El stock disponible es menor a la cantidad",
          severity: "warning",
        })
      }
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

  const calculateTotal = () => {
    return Object.values(cart).reduce((total, item) => {
      const quantity = Number.parseFloat(item.quantity) || 0
      return total + item.precioVenta * quantity
    }, 0)
  }

  const handleCheckout = async () => {
    try {
      setLoading(true)

      for (const [productId, item] of Object.entries(cart)) {
        const product = products.find((p) => p.id === Number.parseInt(productId))
        const quantity = Number.parseFloat(item.quantity) || 0

        if (!product || product.cantidad === 0) {
          setSnackbar({
            open: true,
            message: `Product ${product ? product.producto : productId} is out of stock`,
            severity: "error",
          })
          setLoading(false)
          return
        }

        if (quantity > product.cantidad) {
          setSnackbar({
            open: true,
            message: `Only ${product.cantidad} units of ${product.producto} available`,
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
          const quantity = Number.parseFloat(item.quantity) || 0

          if (!productIds[item.producto]) {
            const realProductId = await getProductIdByName(item.producto)
            setProductIds((prev) => ({ ...prev, [item.producto]: realProductId }))
            formattedSaleData[realProductId] = quantity
            cartDetails[realProductId] = {
              producto: item.producto,
              precioVenta: item.precioVenta,
              quantity: quantity,
            }
          } else {
            formattedSaleData[productIds[item.producto]] = quantity
            cartDetails[productIds[item.producto]] = {
              producto: item.producto,
              precioVenta: item.precioVenta,
              quantity: quantity,
            }
          }
        } catch (error) {
          console.error(`Error getting real product ID for ${item.producto}:`, error)
          setSnackbar({
            open: true,
            message: `Error getting product ID for ${item.producto}`,
            severity: "error",
          })
          setLoading(false)
          return
        }
      }

      console.log("Sale data before API call:", JSON.stringify(formattedSaleData, null, 2))
      const result = await makeSale(formattedSaleData)
      console.log("Sale result:", JSON.stringify(result, null, 2))
      console.log("Cart details:", JSON.stringify(cartDetails, null, 2))

      console.log("Creating sale info from response:", JSON.stringify(result, null, 2))
      console.log("Using cart details:", JSON.stringify(cartDetails, null, 2))

      if (result && Array.isArray(result) && result.length > 0) {
        setSaleInfoDialog({ open: true, saleInfo: result })
        setCart({})
        fetchProducts()
      } else if (result && typeof result === "object" && Object.keys(result).length > 0) {
        console.log("Unexpected response format:", result)
        setSnackbar({
          open: true,
          message: "Unexpected response format from server",
          severity: "warning",
        })
      } else {
        console.error("Empty or invalid response from server")
        throw new Error("Empty or invalid response from server")
      }
    } catch (error) {
      console.error("Error making sale:", error)
      let errorMessage = "Error making sale"
      if (error.response) {
        console.error("Error response:", JSON.stringify(error.response.data, null, 2))
        errorMessage = error.response.data.message || errorMessage
      } else if (error.request) {
        console.error("No response received:", error.request)
      } else {
        console.error("Error details:", error.message)
      }
      setSnackbar({ open: true, message: errorMessage, severity: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Hacer Venta</h2>
      <div className={styles.contentContainer}>
        <div className={styles.productsSection}>
          <div className={styles.card}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Buscar Productos"
                value={search}
                onChange={handleSearch}
                className={styles.searchInput}
              />
              <div className={styles.sortContainer}>
                <select value={sortBy} onChange={handleSortChange} className={styles.select}>
                  <option value="name">Nombre</option>
                  <option value="price">Precio</option>
                  <option value="promotion">Promocion</option>
                </select>
                <button className={styles.iconButton} onClick={fetchProducts} disabled={refreshing}>
                  <Refresh />
                </button>
              </div>
            </div>
            <ul className={styles.productsList}>
              {filteredAndSortedProducts.map((product) => (
                <li key={product.id} className={styles.productItem}>
                  <div className={styles.productInfo}>
                    <div className={styles.productName}>{product.producto}</div>
                    <div className={styles.productDetails}>
                      Precio: ${product.precioVenta.toFixed(2)} | Stock: {product.cantidad}
                      {product.cantidad === 0 && <span className={styles.outOfStock}>Fuera de Stock</span>}
                    </div>
                    {promotions.find((p) => p.producto === product.producto) && (
                      <div className={styles.promotionTag}>Promocion Disponible</div>
                    )}
                  </div>
                  <button
                    className={styles.iconButton}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.cantidad === 0}
                  >
                    <Add />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.cartSection}>
          <div className={styles.card}>
            <h3 className={styles.cartTitle}>Carrito</h3>
            {Object.keys(cart).length === 0 ? (
              <div className={styles.emptyCart}>
                Su carrito está vacío. Agregue productos para continuar con el pago.
              </div>
            ) : (
              <ul className={styles.cartList}>
                {Object.entries(cart).map(([productId, item]) => (
                  <li key={productId} className={styles.cartItem}>
                    <div className={styles.cartItemInfo}>
                      <div className={styles.cartItemName}>{item.producto}</div>
                      <div className={styles.cartItemPrice}>
                        Precio: ${item.precioVenta.toFixed(2)} | Cantidad: {item.quantity}
                      </div>
                    </div>
                    <div className={styles.quantityControls}>
                      <button className={styles.iconButton} onClick={() => handleRemoveFromCart(productId)}>
                        <Remove />
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(productId, e)}
                        className={styles.quantityInput}
                        inputMode="decimal"
                        style={{ width: "70px" }}
                      />
                      <button className={styles.iconButton} onClick={() => handleAddToCart(item)}>
                        <Add />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className={styles.totalAmount}>Total: ${calculateTotal().toFixed(2)}</div>
            <button
              className={styles.checkoutButton}
              onClick={handleCheckout}
              disabled={Object.keys(cart).length === 0 || loading}
            >
              {loading ? "Processing..." : "Checkout"}
            </button>
          </div>
        </div>
      </div>

      {snackbar.open && (
        <div className={`${styles.alert} ${styles[`${snackbar.severity}Alert`]}`}>
          {snackbar.message}
          <button
            className={styles.closeButton}
            onClick={() => setSnackbar({ ...snackbar, open: false })}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      <SaleInfoDialog
        open={saleInfoDialog.open}
        onClose={() => setSaleInfoDialog({ ...saleInfoDialog, open: false })}
        saleInfo={saleInfoDialog.saleInfo}
      />
    </div>
  )
}

export default MakeSale

