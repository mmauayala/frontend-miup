"use client"

import { useState, useEffect } from "react"
import { getPromotionsList } from "../services/api"
import styles from "../styles/PromotionsList.module.css"


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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Lista de Promociones</h2>
        <div className={styles.loadingContainer}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Lista de Promociones</h2>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Lista de Promociones</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>ID</th>
              <th className={styles.tableHeaderCell}>Nombre</th>
              <th className={styles.tableHeaderCell}>Tipo</th>
              <th className={styles.tableHeaderCell}>Cantidad requerida</th>
              <th className={styles.tableHeaderCell}>Cantidad bonificada</th>
              <th className={styles.tableHeaderCell}>Fecha de inicio</th>
              <th className={styles.tableHeaderCell}>Fecha de expiracion</th>
              <th className={styles.tableHeaderCell}>Estado</th>
              <th className={styles.tableHeaderCell}>Producto</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promotion) => (
              <tr key={promotion.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{promotion.id}</td>
                <td className={styles.tableCell}>{promotion.nombre}</td>
                <td className={styles.tableCell}>{promotion.tipo}</td>
                <td className={styles.tableCell}>{promotion.cantidadRequerida}</td>
                <td className={styles.tableCell}>{promotion.cantidadBonificada}</td>
                <td className={styles.tableCell}>{promotion.fechaInicio.join("-")}</td>
                <td className={styles.tableCell}>{promotion.fechaFin.join("-")}</td>
                <td className={styles.tableCell}>
                  <span className={`${styles.chip} ${promotion.activa ? styles.activeChip : styles.inactiveChip}`}>
                    {promotion.activa ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className={styles.tableCell}>{promotion.producto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PromotionsList

