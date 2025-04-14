"use client"

import { useState, useEffect } from "react"
import { getMovementHistory } from "../services/api"
import styles from "../styles/MovementHistory.module.css"

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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Historial de Movimientos</h2>
        <div className={styles.loadingContainer}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Historial de Movimientos</h2>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Historial de Movimientos</h2>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>ID</th>
              <th className={styles.tableHeaderCell}>Fecha</th>
              <th className={`${styles.tableHeaderCell} ${styles.quantityCell}`}>Cantidad</th>
              <th className={styles.tableHeaderCell}>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{movement.id}</td>
                <td className={styles.tableCell}>{new Date(movement.fecha).toLocaleString()}</td>
                <td className={`${styles.tableCell} ${styles.quantityCell}`}>{movement.cantidad}</td>
                <td className={`${styles.tableCell} ${styles.typeCell}`}>{movement.tipo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MovementHistory

