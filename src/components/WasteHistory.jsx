"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material"
import { getWasteHistory, getProducts } from "../services/api"

const WasteHistory = () => {
  const [wasteHistory, setWasteHistory] = useState([])
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      fetchWasteHistory(selectedProduct)
    }
  }, [selectedProduct])

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await getProducts()
      setProducts(fetchedProducts)
      setError(null)
    } catch (err) {
      setError("No se pudieron obtener los productos. Inténtelo nuevamente más tarde.")
      console.error("Error al obtener los productos:", err)
    }
  }

  const fetchWasteHistory = async (productId) => {
    try {
      setLoading(true)
      const data = await getWasteHistory(productId)
      setWasteHistory(data)
      setError(null)
    } catch (err) {
      setError("No se pudo obtener el historial de residuos. Inténtelo de nuevo más tarde.")
      console.error("Error al obtener el historial de residuos:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value)
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Historial de Desperdicios
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="product-select-label">Selecciona el producto</InputLabel>
        <Select
          labelId="product-select-label"
          id="product-select"
          value={selectedProduct}
          label="Selecciona el producto"
          onChange={handleProductChange}
        >
          {products.map((product) => (
            <MenuItem key={product.id} value={product.id}>
              {product.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Fecha de desperdicio</TableCell>
                <TableCell align="right">Cantidad</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wasteHistory.map((waste) => (
                <TableRow key={waste.id}>
                  <TableCell>{waste.id}</TableCell>
                  <TableCell>{waste.producto}</TableCell>
                  <TableCell>
                    {waste.fechaDesperdicio ? new Date(waste.fechaDesperdicio).toLocaleString() : "N/A"}
                  </TableCell>
                  <TableCell align="right">{waste.cantidad}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default WasteHistory

