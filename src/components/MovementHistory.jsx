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
import { getMovementHistory } from "../services/api"

const MovementHistory = () => {
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMovementHistory()
  }, [])

  const fetchMovementHistory = async () => {
    try {
      setLoading(true)
      const data = await getMovementHistory()
      setMovements(data)
      setError(null)
    } catch (err) {
      setError("No se pudo obtener el historial de movimientos. Inténtalo de nuevo.")
      console.error("Error al obtener el historial de movimientos:", err)
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
        Historia Movimientos
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell>Tipo de Movimiento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell component="th" scope="row">
                  {movement.id}
                </TableCell>
                <TableCell>{new Date(movement.fecha).toLocaleString()}</TableCell>
                <TableCell align="right">{movement.cantidad}</TableCell>
                <TableCell>{movement.tipo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default MovementHistory

