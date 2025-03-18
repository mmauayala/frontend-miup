"use client"

import { useState, useEffect } from "react"
import { Edit, Delete, VisibilityOff, Visibility } from "@mui/icons-material"
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/api"
import styles from "../styles/ProductManager.module.css"

const ProductManager = () => {
  const [products, setProducts] = useState([])
  const [name, setName] = useState("")
  const [medida, setMedida] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  // Local state to track products that can't be deleted
  const [undeletableProducts, setUndeletableProducts] = useState(new Set())
  // Local state to track hidden products (purely visual)
  const [hiddenProducts, setHiddenProducts] = useState(new Set())

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await getProducts()
      setProducts(fetchedProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateProduct(editingId, { name, medida })
        setProducts(products.map((p) => (p.id === editingId ? { ...p, name, medida } : p)))
        setEditingId(null)
        setSuccess("Product updated successfully")
      } else {
        const newProduct = await createProduct({ name, medida })
        setProducts([...products, newProduct])
        setSuccess("Product created successfully")
      }
      setName("")
      setMedida("")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error submitting product:", error)
      setError("Error saving product. Please try again.")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleEdit = (product) => {
    setName(product.name)
    setMedida(product.medida)
    setEditingId(product.id)
  }

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id)
      setProducts(products.filter((p) => p.id !== id))

      // If the product was previously marked as undeletable, remove it from the set
      if (undeletableProducts.has(id)) {
        const newSet = new Set(undeletableProducts)
        newSet.delete(id)
        setUndeletableProducts(newSet)
      }

      // Also remove from hidden products if it was there
      if (hiddenProducts.has(id)) {
        const newHiddenSet = new Set(hiddenProducts)
        newHiddenSet.delete(id)
        setHiddenProducts(newHiddenSet)
      }

      setSuccess("Product deleted successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error deleting product:", error)

      // Check for 404 error which indicates the product has associated sales
      if (error.response && error.response.status === 404) {
        // Add this product ID to the set of undeletable products
        setUndeletableProducts(new Set(undeletableProducts).add(id))

        // Don't show the error message as requested by the user
        // setError("Cannot delete this product because it has associated sales records.")
      } else {
        setError("Error deleting product. Please try again later.")
        setTimeout(() => setError(null), 5000)
      }
    }
  }

  // Toggle product visibility (purely visual, no API calls)
  const toggleVisibility = (id) => {
    setHiddenProducts((prevHidden) => {
      const newHidden = new Set(prevHidden)
      if (newHidden.has(id)) {
        newHidden.delete(id)
      } else {
        newHidden.add(id)
      }
      return newHidden
    })
  }

  return (
    <div className={styles.container}>
      {error && (
        <div className={`${styles.alert} ${styles.errorAlert}`}>
          {error}
          <button className={styles.closeButton} onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div className={`${styles.alert} ${styles.successAlert}`}>
          {success}
          <button className={styles.closeButton} onClick={() => setSuccess(null)}>
            ×
          </button>
        </div>
      )}

      <div className={styles.formSection}>
        <h2 className={styles.title}>{editingId ? "Edit Product" : "Add New Product"}</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            className={styles.inputField}
            placeholder="Measure (e.g., kg, units)"
            value={medida}
            onChange={(e) => setMedida(e.target.value)}
            required
          />
          <button type="submit" className={styles.button}>
            {editingId ? "Update Product" : "Add Product"}
          </button>
          {editingId && (
            <button
              type="button"
              className={styles.button}
              onClick={() => {
                setEditingId(null)
                setName("")
                setMedida("")
              }}
              style={{ backgroundColor: "#6c757d" }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className={styles.listSection}>
        <h2 className={styles.title}>Product List</h2>
        {products.length === 0 ? (
          <p>No products found. Add your first product!</p>
        ) : (
          <ul className={styles.productList}>
            {products.map((product) => {
              const isUndeletable = undeletableProducts.has(product.id)
              const isHidden = hiddenProducts.has(product.id)

              return (
                <li
                  key={product.id}
                  className={`
                    ${styles.productItem} 
                    ${isUndeletable ? styles.undeletableProduct : ""} 
                    ${isHidden ? styles.hiddenProduct : ""}
                  `}
                >
                  <div className={styles.productInfo}>
                    <div
                      className={isHidden ? `${styles.productName} ${styles.productNameHidden}` : styles.productName}
                    >
                      {product.name}
                      {isHidden && <span className={styles.hiddenTag}>(Oculto)</span>}
                    </div>
                    <div className={styles.productMeasure}>Measure: {product.medida}</div>
                  </div>
                  <div className={styles.actionButtons}>
                    <button
                      className={`${styles.iconButton} ${styles.editButton}`}
                      onClick={() => handleEdit(product)}
                      aria-label="Edit product"
                    >
                      <Edit />
                    </button>
                    <button
                      className={`${styles.iconButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(product.id)}
                      aria-label="Delete product"
                    >
                      <Delete />
                    </button>
                    <button
                      className={`${styles.iconButton} ${isHidden ? styles.visibleButton : styles.invisibleButton}`}
                      onClick={() => toggleVisibility(product.id)}
                      aria-label={isHidden ? "Make product visible" : "Make product invisible"}
                    >
                      {isHidden ? <Visibility /> : <VisibilityOff />}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ProductManager

