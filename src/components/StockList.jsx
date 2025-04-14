"use client"

import { useState, useEffect } from "react"
import { getStockList } from "../services/api"
import styles from "../styles/StockList.module.css"

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
    } finally {
      setLoading(false)
    }
  }

  
  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Stock List</h2>
        <div className={styles.loadingContainer}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Lista de Stock</h2>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Stock List</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>Nombre del producto</th>
              <th className={`${styles.tableHeaderCell} ${styles.quantityCell}`}>Cantidad</th>
              <th className={`${styles.tableHeaderCell} ${styles.dateCell}`}>Fecha de ingreso</th>
              <th className={`${styles.tableHeaderCell} ${styles.priceCell}`}>Fecha de expiracion</th>
              <th className={`${styles.tableHeaderCell} ${styles.priceCell}`}>Precio de Venta</th>
            </tr>
          </thead>
          <tbody>
            {stockItems.map((item) => (
              <tr key={item.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{item.producto}</td>
                <td className={`${styles.tableCell} ${styles.quantityCell}`}>{item.cantidad}</td>
                <td className={`${styles.tableCell} ${styles.dateCell}`}>
                  {new Date(item.fechaIngreso).toLocaleDateString()}
                </td>
                <td className={`${styles.tableCell} ${styles.priceCell}`}>${item.precioIngreso.toFixed(2)}</td>
                <td className={`${styles.tableCell} ${styles.priceCell}`}>${item.precioVenta.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StockList

