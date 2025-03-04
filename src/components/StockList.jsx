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
} from "@mui/material"
import { getStockList } from "../services/api"

const StockList = () => {
  const [stockItems, setStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStockList()
  }, [])

  const fetchStockList = async () => {
    try {
      setLoading(true)
      const data = await getStockList()
      setStockItems(data)
      setError(null)
    } catch (err) {
      setError("No se pudo obtener la lista de existencias. Inténtelo nuevamente más tarde.")
      console.error("Error al obtener la lista de existencias:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    )
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
        Stock List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Fecha de Ingreso</TableCell>
              <TableCell align="right">Precio de Ingreso</TableCell>
              <TableCell align="right">Precio de Venta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell component="th" scope="row">
                  {item.producto}
                </TableCell>
                <TableCell align="right">{item.cantidad}</TableCell>
                <TableCell align="right">{new Date(item.fechaIngreso).toLocaleDateString()}</TableCell>
                <TableCell align="right">${item.precioIngreso.toFixed(2)}</TableCell>
                <TableCell align="right">${item.precioVenta.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default StockList

