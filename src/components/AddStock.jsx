"use client"

import { useState, useEffect } from "react"
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Grid,
} from "@mui/material"
import { getProducts, addStock } from "../services/api"

const AddStock = () => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [salePrice, setSalePrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await getProducts()
      setProducts(fetchedProducts)
    } catch (err) {
      setError("No se pudieron obtener los productos. Inténtelo nuevamente más tarde.")
      console.error("Error al obtener los productos:", err)
    }
  }

  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value)
  }

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value)
  }

  const handlePurchasePriceChange = (event) => {
    setPurchasePrice(event.target.value)
  }

  const handleSalePriceChange = (event) => {
    setSalePrice(event.target.value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const stockData = {
        cantidad: Number(quantity),
        precioIngreso: Number(purchasePrice),
        precioVenta: Number(salePrice),
      }

      const result = await addStock(selectedProduct, stockData)
      setSuccess(
        `Stock añadido con éxito. Product: ${result.producto}, Cantidad: ${result.cantidad}, Precio de compra: $${result.precioIngreso}, Precio de venta: $${result.precioVenta}`,
      )
      setSelectedProduct("")
      setQuantity("")
      setPurchasePrice("")
      setSalePrice("")
    } catch (err) {
      setError("No se pudo agregar stock. Inténtalo nuevamente.")
      console.error("Error al agregar stock:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        AÑADIR STOCK
      </Typography>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="product-select-label">Seleccionar producto</InputLabel>
                <Select
                  labelId="product-select-label"
                  id="product-select"
                  value={selectedProduct}
                  label="Seleccionar producto"
                  onChange={handleProductChange}
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cantidad"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                required
                inputAttrs={{ min: 0.01, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio de compra"
                type="number"
                value={purchasePrice}
                onChange={handlePurchasePriceChange}
                required
                inputAttrs={{ min: 0.01, step: 0.01 }}
                InputAttrs={{
                  startAdornment: <span>$</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio de venta"
                type="number"
                value={salePrice}
                onChange={handleSalePriceChange}
                required
                inputAttrs={{ min: 0.01, step: 0.01 }}
                InputAttrs={{
                  startAdornment: <span>$</span>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 1 }}>
                {loading ? <CircularProgress size={24} /> : "Agregar Stock"}
              </Button>
            </Grid>
          </Grid>
        </form>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </Paper>
    </Box>
  )
}

export default AddStock

