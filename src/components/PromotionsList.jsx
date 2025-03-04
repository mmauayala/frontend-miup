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
  Chip,
} from "@mui/material"
import { getPromotionsList } from "../services/api"

const PromotionsList = () => {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPromotionsList()
  }, [])

  const fetchPromotionsList = async () => {
    try {
      setLoading(true)
      const data = await getPromotionsList()
      setPromotions(data)
      setError(null)
    } catch (err) {
      setError("No se pudo obtener la lista de promociones. Inténtalo nuevamente más tarde.")
      console.error("Error al obtener la lista de promociones:", err)
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
    <Box sx={{ maxWidth: 1200, margin: "auto", padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Lista de Promociones
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Cantidad Requerida</TableCell>
              <TableCell>Cantidad Bonificada</TableCell>
              <TableCell>Fecha de Inicio</TableCell>
              <TableCell>Fecha de Caducidad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Producto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {promotions.map((promotion) => (
              <TableRow key={promotion.id}>
                <TableCell>{promotion.id}</TableCell>
                <TableCell>{promotion.nombre}</TableCell>
                <TableCell>{promotion.tipo}</TableCell>
                <TableCell>{promotion.cantidadRequerida}</TableCell>
                <TableCell>{promotion.cantidadBonificada}</TableCell>
                <TableCell>{promotion.fechaInicio.join("-")}</TableCell>
                <TableCell>{promotion.fechaFin.join("-")}</TableCell>
                <TableCell>
                  <Chip
                    label={promotion.activa ? "Active" : "Inactive"}
                    color={promotion.activa ? "success" : "default"}
                  />
                </TableCell>
                <TableCell>{promotion.producto}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default PromotionsList

