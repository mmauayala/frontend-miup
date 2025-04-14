"use client"

import { useState, useEffect } from "react"
import { TextField } from "@mui/material"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { getProducts, createPromotion, updatePromotionStatus, getPromotionsList } from "../services/api"
import styles from "../styles/PromotionsManager.module.css"

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
      throw error
    }
  }

  const handleStatusChange = async (id, activa) => {
    try {
      await updatePromotionStatus(id, !activa)
      fetchPromotions()
    } catch (error) {
      throw error
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Gestor de Promociones</h2>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Nombre de Promocion</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tipo</label>
            <select name="tipo" value={formData.tipo} onChange={handleInputChange} className={styles.select} required>
              <option value="CANTIDAD">Cantidad</option>
              <option value="PORCENTAJE">Porcentaje</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Cantidad Requerida</label>
            <input
              type="number"
              name="cantidadRequerida"
              value={formData.cantidadRequerida}
              onChange={handleInputChange}
              className={styles.input}
              required
              min="1"
              step="1"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Cantidad Bonificada</label>
            <input
              type="number"
              name="cantidadBonificada"
              value={formData.cantidadBonificada}
              onChange={handleInputChange}
              className={styles.input}
              required
              min="1"
              step="1"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Valor</label>
            <input
              type="number"
              name="valor"
              value={formData.valor}
              onChange={handleInputChange}
              className={styles.input}
              min="0"
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Fecha de Expiracion</label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={formData.fechaFin}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} className={styles.datePicker} required />}
              />
            </LocalizationProvider>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Producto</label>
            <select
              name="producto"
              value={formData.producto}
              onChange={handleInputChange}
              className={styles.select}
              required
            >
              <option value="">Seleccionar producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <button type="submit" className={styles.button}>
              Crear Promocion
            </button>
          </div>
        </form>
      </div>

      <h3 className={styles.title}>Promociones Existentes</h3>
      <div className={styles.promotionsList}>
        {promotions.map((promotion) => (
          <div key={promotion.id} className={styles.promotionCard}>
            <div className={styles.promotionDetails}>
              <h3>{promotion.nombre}</h3>
              <p>Tipo: {promotion.tipo}</p>
              <p>Cantidad Requerida: {promotion.cantidadRequerida}</p>
              <p>Cantidad Bonificada: {promotion.cantidadBonificada}</p>
              <p>Fecha de Expiracion: {new Date(promotion.fechaFin.join("-")).toLocaleDateString()}</p>
              <p>Producto: {promotion.producto}</p>
            </div>
            <div className={styles.switchContainer}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={promotion.activa}
                  onChange={() => handleStatusChange(promotion.id, promotion.activa)}
                />
                <span className={styles.slider}></span>
              </label>
              <span className={styles.switchLabel}>{promotion.activa ? "Active" : "Inactive"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PromotionsManager

