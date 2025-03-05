"use client"

import { useState, useEffect } from "react"
import { Edit, Delete } from "@mui/icons-material"
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/api"
import styles from "../styles/ProductManager.module.css"

const ProductManager = () => {
  const [products, setProducts] = useState([])
  const [name, setName] = useState("")
  const [medida, setMedida] = useState("")
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await getProducts()
      setProducts(fetchedProducts)
    } catch (error) {
      console.error("Error al obtener los productos:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateProduct(editingId, { name, medida })
        setProducts(products.map((p) => (p.id === editingId ? { ...p, name, medida } : p)))
        setEditingId(null)
      } else {
        const newProduct = await createProduct({ name, medida })
        setProducts([...products, newProduct])
      }
      setName("")
      setMedida("")
    } catch (error) {
      console.error("Error al enviar el producto:", error)
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
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <h2 className={styles.title}>{editingId ? "Editar Producto" : "Añadir Nuevo Product"}</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Nombre del producto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            className={styles.inputField}
            placeholder="Medida (ej. g., kg, unidad)"
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
          <p>No se encontraron productos. Agrega tu primer producto!</p>
        ) : (
          <ul className={styles.productList}>
            {products.map((product) => (
              <li key={product.id} className={styles.productItem}>
                <div className={styles.productInfo}>
                  <div className={styles.productName}>{product.name}</div>
                  <div className={styles.productMeasure}>Medida: {product.medida}</div>
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ProductManager

