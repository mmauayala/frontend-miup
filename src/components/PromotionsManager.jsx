"use client"

import { useState, useEffect } from "react"
import {
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
} from "@mui/material"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { getProducts, createPromotion, updatePromotionStatus, getPromotionsList } from "../services/api"

const PromotionsManager = () => {
  const [products, setProducts] = useState([])
  const [promotions, setPromotions] = useState([])
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "CANTIDAD",
    valor: "",
    cantidadRequerida: "",
    cantidadBonificada: "",
    fechaFin: null,
    producto: "",
  })

  useEffect(() => {
    fetchProducts()
    fetchPromotions()
  }, [])

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await getProducts()
      setProducts(fetchedProducts)
    } catch (error) {
      console.error("Error al obtener los productos:", error)
    }
  }

  const fetchPromotions = async () => {
    try {
      const fetchedPromotions = await getPromotionsList()
      setPromotions(fetchedPromotions)
    } catch (error) {
      console.error("Error al obtener promociones:", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleDateChange = (date) => {
    setFormData({ ...formData, fechaFin: date })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const promotionData = {
        ...formData,
        fechaFin: formData.fechaFin.toISOString().split("T")[0],
        valor: formData.valor || null,
      }
      await createPromotion(promotionData)
      setFormData({
        nombre: "",
        tipo: "CANTIDAD",
        valor: "",
        cantidadRequerida: "",
        cantidadBonificada: "",
        fechaFin: null,
        producto: "",
      })
      fetchPromotions()
    } catch (error) {
      console.error("Error al crear la promoción:", error)
    }
  }

  const handleStatusChange = async (id, activa) => {
    try {
      await updatePromotionStatus(id, !activa)
      fetchPromotions()
    } catch (error) {
      console.error("Error al actualizar el estado de la promoción:", error)
    }
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Promotion Manager
      </Typography>
      <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
            <Box sx={{ gridColumn: "1 / 3" }}>
              <TextField
                fullWidth
                label="Nombre de Promocion"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </Box>
            <Box sx={{ gridColumn: "1 / 2" }}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select name="tipo" value={formData.tipo} onChange={handleInputChange} required>
                  <MenuItem value="CANTIDAD">Cantidad</MenuItem>
                  <MenuItem value="PORCENTAJE">Porcentaje</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: "2 / 3" }}>
              <TextField
                fullWidth
                label="Cantidad Requerida"
                name="cantidadRequerida"
                type="number"
                value={formData.cantidadRequerida}
                onChange={handleInputChange}
                required
              />
            </Box>
            <Box sx={{ gridColumn: "1 / 2" }}>
              <TextField
                fullWidth
                label="Cantidad Bonificada"
                name="cantidadBonificada"
                type="number"
                value={formData.cantidadBonificada}
                onChange={handleInputChange}
                required
              />
            </Box>
            <Box sx={{ gridColumn: "2 / 3" }}>
              <TextField
                fullWidth
                label="Valor"
                name="valor"
                type="number"
                value={formData.valor}
                onChange={handleInputChange}
              />
            </Box>
            <Box sx={{ gridColumn: "1 / 2" }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Fecha de finalización"
                  value={formData.fechaFin}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ gridColumn: "1 / 3" }}>
              <FormControl fullWidth>
                <InputLabel>Producto</InputLabel>
                <Select name="producto" value={formData.producto} onChange={handleInputChange} required>
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: "1 / 3" }}>
              <Button type="submit" variant="contained" color="primary">
                Crear Promocion
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
      <Typography variant="h5" gutterBottom>
        Promociones existentes
      </Typography>
      {promotions.map((promotion) => (
        <Paper key={promotion.id} elevation={2} sx={{ padding: 2, marginBottom: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, alignItems: "center" }}>
            <Box sx={{ gridColumn: "1 / 2" }}>
              <Typography variant="h6">{promotion.nombre}</Typography>
              <Typography>Tipo: {promotion.tipo}</Typography>
              <Typography>Cantidad Requerida: {promotion.cantidadRequerida}</Typography>
              <Typography>Cantidad Bonificada: {promotion.cantidadBonificada}</Typography>
              <Typography>Fecha de finalización: {new Date(promotion.fechaFin.join("-")).toLocaleDateString()}</Typography>
              <Typography>Producto: {promotion.producto}</Typography>
            </Box>
            <Box sx={{ gridColumn: "2 / 3" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={promotion.activa}
                    onChange={() => handleStatusChange(promotion.id, promotion.activa)}
                  />
                }
                label={promotion.activa ? "Active" : "Inactive"}
              />
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  )
}

export default PromotionsManager

