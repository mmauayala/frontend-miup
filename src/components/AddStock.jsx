"use client"

import { useState, useEffect } from "react"
import { getProducts, addStock } from "../services/api"
import styles from "../styles/AddStock.module.css"

const AddStock = () => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [salePrice, setSalePrice] = useState("")
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

  const handlePurchasePriceChange = (event) => {
    setPurchasePrice(event.target.value)
  }

  const handleSalePriceChange = (event) => {
    setSalePrice(event.target.value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const stockData = {
        cantidad: Number(quantity),
        precioIngreso: Number(purchasePrice),
        precioVenta: Number(salePrice),
      }

      const result = await addStock(selectedProduct, stockData)
      setSuccess(
        `Stock añadido con éxito. Producto: ${result.producto}, Cantidad: ${result.cantidad}, Precio de compra: $${result.precioIngreso}, Precio de venta: $${result.precioVenta}`,
      )
      setSelectedProduct("")
      setQuantity("")
      setPurchasePrice("")
      setSalePrice("")
    } catch (err) {
      setError("No se pudo agregar stock. Inténtalo nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Añadir Stock</h2>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="product-select">
              Seleccionar Producto
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

          <div className={styles.pricesContainer}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="purchase-price">
                Precio de compra
              </label>
              <div className={styles.priceInputContainer}>
                <span className={styles.currencySymbol}>$</span>
                <input
                  id="purchase-price"
                  className={`${styles.input} ${styles.priceInput}`}
                  type="number"
                  value={purchasePrice}
                  onChange={handlePurchasePriceChange}
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="sale-price">
                Precio de venta
              </label>
              <div className={styles.priceInputContainer}>
                <span className={styles.currencySymbol}>$</span>
                <input
                  id="sale-price"
                  className={`${styles.input} ${styles.priceInput}`}
                  type="number"
                  value={salePrice}
                  onChange={handleSalePriceChange}
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Procesando..." : "Añadir Stock"}
          </button>
        </form>

        {error && <div className={`${styles.alert} ${styles.errorAlert}`}>{error}</div>}

        {success && <div className={`${styles.alert} ${styles.successAlert}`}>{success}</div>}
      </div>
    </div>
  )
}

export default AddStock

