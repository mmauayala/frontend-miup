"use client"

import { useState, useEffect, useContext } from "react"
import { logout, getCurrentUser } from "../../services/api"
import { ThemeContext } from "../../context/ThemeContext"
import ProductManager from "../ProductManager"
import StockList from "../StockList"
import MovementHistory from "../MovementHistory"
import PromotionsList from "../PromotionsList"
import WasteHistory from "../WasteHistory"
import EnterWaste from "../EnterWaste"
import PromotionsManager from "../PromotionsManager"
import MakeSale from "../MakeSale"
import AddStock from "../AddStock"


import styles from "./Dashboard.module.css"

// Import icons
import {
  Inventory,
  Assessment,
  Delete,
  LocalOffer,
  ShoppingCart,
  History,
  Logout,
  Add,
  Brightness4,
  Brightness7
} from "@mui/icons-material"

const menuItems = [
  { text: "Crear/Editar/Borrar Producto", icon: <Inventory />, component: "ProductManager", adminOnly: true },
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
  const { theme, toggleTheme } = useContext(ThemeContext)
  const [selectedComponent, setSelectedComponent] = useState(null)
  const user = getCurrentUser()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(user?.userType === "ADMIN")
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = "/login"
    } catch (error) {
      throw error
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
        return (
          <div className={styles.welcomeMessage}>
            <h2>Bienvenido a MIUP Dashboard</h2>
            <p>Selecciona una opción del menú para comenzar.</p>
          </div>
        )
    }
  }

  return (
    <div className={styles.dashboardRoot}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <div className={styles.logoContainer}>
            <h1 className={styles.logo}>Me Importa Un Pepino</h1>
          </div>
          <div className={styles.userControls}>
            <h1 className={styles.username}>{user?.username}</h1>
            <div className={styles.userAvatar}>{user?.username?.charAt(0)?.toUpperCase()}</div>
            <button className={styles.iconButton} onClick={toggleTheme}>
              {theme === "light" ? <Brightness4 /> : <Brightness7 />}
            </button>
            <button className={styles.iconButton} onClick={handleLogout}>
              <Logout />
            </button>
          </div>
        </div>
      </header>

      <div className={styles.mainContainer}>
        <aside className={styles.sidebarOpen}>
          <nav className={styles.sidebarNav}>
            <ul className={styles.sidebarMenu}>
              {menuItems.map(
                (item) =>
                  (!item.adminOnly || (item.adminOnly && isAdmin)) && (
                    <li key={item.text} className={styles.sidebarMenuItem}>
                      <button
                        className={`${styles.sidebarMenuButton} ${selectedComponent === item.component ? styles.active : ""}`}
                        onClick={() => handleMenuItemClick(item.component)}
                      >
                        <span className={styles.menuIcon}>{item.icon}</span>
                        <span className={styles.menuText}>{item.text}</span>
                      </button>
                    </li>
                  ),
              )}
            </ul>
          </nav>
        </aside>

        <main className={styles.content}>{renderComponent()}</main>

      </div>

    </div>
  )
}

export default Dashboard