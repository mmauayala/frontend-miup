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
  const [undeletableProducts, setUndeletableProducts] = useState(new Set())
  const [hiddenProducts, setHiddenProducts] = useState(new Set())

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await getProducts()
      setProducts(fetchedProducts)
    } catch (error) {
      console.error("Error al buscar productos:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateProduct(editingId, { name, medida })
        setProducts(products.map((p) => (p.id === editingId ? { ...p, name, medida } : p)))
        setEditingId(null)
        setSuccess("Producto actualizado exitosamente")
      } else {
        const newProduct = await createProduct({ name, medida })
        setProducts([...products, newProduct])
        setSuccess("Producto creado exitosamente")
      }
      setName("")
      setMedida("")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error al enviar el producto:", error)
      setError("Error al guardar el producto. Inténtalo de nuevo.")
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

      if (undeletableProducts.has(id)) {
        const newSet = new Set(undeletableProducts)
        newSet.delete(id)
        setUndeletableProducts(newSet)
      }

      if (hiddenProducts.has(id)) {
        const newHiddenSet = new Set(hiddenProducts)
        newHiddenSet.delete(id)
        setHiddenProducts(newHiddenSet)
      }

      setSuccess("Producto borrado exitosamente")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error al borrar producto:", error)

      if (error.response && error.response.status === 404) {

        setUndeletableProducts(new Set(undeletableProducts).add(id))

      } else {
        setError("Error al borrar. Intentalo mas tarde.")
        setTimeout(() => setError(null), 5000)
      }
    }
  }

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
        <h2 className={styles.title}>{editingId ? "Editar Producto" : "Añadir producto nuevo"}</h2>
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
            {editingId ? "Editar Producto" : "Añadir Producto"}
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
        <h2 className={styles.title}>Lista de Productos</h2>
        {products.length === 0 ? (
          <p>No se encontraron productos. Añade tu primer producto!</p>
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
                      aria-label="Editar producto"
                    >
                      <Edit />
                    </button>
                    <button
                      className={`${styles.iconButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(product.id)}
                      aria-label="Borrar producto"
                    >
                      <Delete />
                    </button>
                    <button
                      className={`${styles.iconButton} ${isHidden ? styles.visibleButton : styles.invisibleButton}`}
                      onClick={() => toggleVisibility(product.id)}
                      aria-label={isHidden ? "Hacer visible el producto" : "Hacer invisible el producto"}
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

