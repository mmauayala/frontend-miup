"use client"

import { useState, useEffect } from "react"
import { TextField, Button, List, ListItem, ListItemText, IconButton, Typography, Box } from "@mui/material"
import { Edit, Delete } from "@mui/icons-material"
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/api"

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
      } else {
        const newProduct = await createProduct({ name, medida })
        setProducts([...products, newProduct])
      }
      setName("")
      setMedida("")
    } catch (error) {
      console.error("Error submitting product:", error)
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
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Product Manager
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Measure"
          value={medida}
          onChange={(e) => setMedida(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          {editingId ? "Update Product" : "Add Product"}
        </Button>
      </form>
      <List sx={{ mt: 4 }}>
        {products.map((product) => (
          <ListItem
            key={product.id}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(product)}>
                  <Edit />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(product.id)}>
                  <Delete />
                </IconButton>
              </>
            }
          >
            <ListItemText primary={product.name} secondary={`Measure: ${product.medida}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default ProductManager

