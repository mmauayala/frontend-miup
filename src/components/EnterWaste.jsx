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
} from "@mui/material"
import { getProducts, enterWaste } from "../services/api"

const EnterWaste = () => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState("")
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
      console.error("Error obteniendo productos:", err)
    }
  }

  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value)
  }

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await enterWaste(selectedProduct, Number.parseFloat(quantity))
      setSuccess(`Entrada de desperdicios exitosa. ID: ${result.id}, Producto: ${result.producto}, Cantidad: ${result.cantidad}`)
      setSelectedProduct("")
      setQuantity("")
    } catch (err) {
      setError("No se pudo ingresar desperdicios. Intenta nuevamente.")
      console.error("Error al ingresar desperdicio:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        INGRESAR DESPERDICIO
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="product-select-label">Seleccionar Producto</InputLabel>
          <Select
            labelId="product-select-label"
            id="product-select"
            value={selectedProduct}
            label="Seleccionar Producto"
            onChange={handleProductChange}
            required
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Cantidad"
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          sx={{ mb: 2 }}
          required
          inputAttrs={{ min: 0, step: 0.01 }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Enter Waste"}
        </Button>
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
    </Box>
  )
}

export default EnterWaste

