"use client"

import { useState, useEffect } from "react"
import { getWasteHistory, getProducts } from "../services/api"
import styles from "../styles/WasteHistory.module.css"

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
      <div className={styles.container}>
        <h2 className={styles.title}>Historial de Desperdicio</h2>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Historial de Desperdicio</h2>
      <div className={styles.selectContainer}>
        <select
          className={styles.select}
          value={selectedProduct}
          onChange={handleProductChange}
        >
          <option value="">Selecciona un Producto</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>ID</th>
                <th className={styles.tableHeaderCell}>Producto</th>
                <th className={styles.tableHeaderCell}>Fecha de Desperdicio</th>
                <th className={`${styles.tableHeaderCell} ${styles.quantityCell}`}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {wasteHistory.map((waste) => (
                <tr key={waste.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{waste.id}</td>
                  <td className={styles.tableCell}>{waste.producto}</td>
                  <td className={styles.tableCell}>
                    {waste.fechaDesperdicio ? new Date(waste.fechaDesperdicio).toLocaleString() : "N/A"}
                  </td>
                  <td className={`${styles.tableCell} ${styles.quantityCell}`}>{waste.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default WasteHistory

