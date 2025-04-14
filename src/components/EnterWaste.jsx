"use client"

import { useState, useEffect } from "react"
import { getProducts, enterWaste } from "../services/api"
import styles from "../styles/EnterWaste.module.css"

const EnterWaste = () => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await getProducts()
      setProducts(fetchedProducts)
    } catch (err) {
      setError("No se pudieron obtener los productos. Inténtelo nuevamente más tarde.")
    }
  }

  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value)
  }

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await enterWaste(selectedProduct, Number.parseFloat(quantity))
      setSuccess(`Entrada de desperdicios exitosa. ID: ${result.id}, Producto: ${result.producto}, Cantidad: ${result.cantidad}`)
      setSelectedProduct("")
      setQuantity("")
    } catch (err) {
      setError("No se pudo ingresar desperdicios. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ingresar Desperdicio</h2>
      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="product-select">
              Select Product
            </label>
            <select
              id="product-select"
              className={styles.select}
              value={selectedProduct}
              onChange={handleProductChange}
              required
            >
              <option value="">Seleccionar Producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="quantity">
              Cantidad
            </label>
            <input
              id="quantity"
              className={styles.input}
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              required
              min="0.01"
              step="0.01"
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Procesando..." : "Ingresar Desperdicio"}
          </button>
        </form>

        {error && <div className={`${styles.alert} ${styles.errorAlert}`}>{error}</div>}

        {success && <div className={`${styles.alert} ${styles.successAlert}`}>{success}</div>}
      </div>
    </div>
  )
}

export default EnterWaste

