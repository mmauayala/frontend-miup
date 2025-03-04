"use client"

import { useState, useEffect } from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Box,
} from "@mui/material"
import { Inventory, Assessment, Delete, LocalOffer, ShoppingCart, History, Logout, Add } from "@mui/icons-material"
import { logout, getCurrentUser } from "../../services/api"
import ProductManager from "../ProductManager"
import StockList from "../StockList"
import MovementHistory from "../MovementHistory"
import PromotionsList from "../PromotionsList"
import WasteHistory from "../WasteHistory"
import EnterWaste from "../EnterWaste"
import PromotionsManager from "../PromotionsManager"
import MakeSale from "../MakeSale"
import AddStock from "../AddStock"

import "./Dashboard.css"

const menuItems = [
  { text: "Create/Edit/Delete Product", icon: <Inventory />, component: "ProductManager", adminOnly: true },
  { text: "Ver lista de Stock", icon: <Assessment />, component: "StockList" },
  { text: "Añadir Stock", icon: <Add />, component: "AddStock", adminOnly: true },
  { text: "Historial de Desperdicios", icon: <Delete />, component: "WasteHistory" },
  { text: "Ingresar Desperdicio", icon: <Delete />, component: "EnterWaste" },
  { text: "Crear/Editar Promociones", icon: <LocalOffer />, component: "PromotionsManager", adminOnly: true },
  { text: "Lista de Promociones", icon: <LocalOffer />, component: "PromotionsList" },
  { text: "Realizar Venta", icon: <ShoppingCart />, component: "MakeSale" },
  { text: "Historial de Movimientos", icon: <History />, component: "MovementHistory", adminOnly: true },
]

const Dashboard = () => {
  const [selectedComponent, setSelectedComponent] = useState(null)
  const user = getCurrentUser()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(user?.userType === "ADMIN")
  }, [user])

  console.log("Usuario actual:", user) // Add this line for debugging

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = "/login"
    } catch (error) {
      console.error("Fallo en el logout:", error)
    }
  }

  const handleMenuItemClick = (component) => {
    setSelectedComponent(component)
  }

  const renderComponent = () => {
    switch (selectedComponent) {
      case "ProductManager":
        return <ProductManager />
      case "StockList":
        return <StockList />
      case "MovementHistory":
        return <MovementHistory />
      case "PromotionsList":
        return <PromotionsList />
      case "WasteHistory":
        return <WasteHistory />
      case "EnterWaste":
        return <EnterWaste />
      case "PromotionsManager":
        return <PromotionsManager />
      case "MakeSale":
        return <MakeSale />
      case "AddStock":
        return <AddStock />
      default:
        return <Typography variant="body1">MIUP Dashboard.</Typography>
    }
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" className="dashboard-appbar">
        <Toolbar className="dashboard-toolbar">
          <Typography variant="h6" component="div">
            MIUP
          </Typography>
          <div className="dashboard-user-info">
            <Typography>{user?.username}</Typography>
            <Avatar className="dashboard-avatar">{user?.username?.charAt(0)?.toUpperCase()}</Avatar>
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className="dashboard-drawer"
        classes={{
          paper: "dashboard-drawer-paper",
        }}
      >
        <Toolbar />
        <div className="dashboard-drawer-container">
          <List>
            {menuItems.map((item) => {
              console.log(`Menu item ${item.text}:`, !item.adminOnly || (item.adminOnly && isAdmin)) // Add this line for debugging
              return (
                (!item.adminOnly || (item.adminOnly && isAdmin)) && (
                  <ListItem
                    button
                    key={item.text}
                    onClick={() => handleMenuItemClick(item.component)}
                    className="dashboard-menu-item"
                  >
                    <ListItemIcon className="dashboard-menu-icon">{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                )
              )
            })}
          </List>
        </div>
      </Drawer>
      <Box component="main" className="dashboard-content">
        <Toolbar />
        {renderComponent()}
      </Box>
    </Box>
  )
}

export default Dashboard

