"use client"

import { useState, useEffect, useCallback } from "react"
import { refreshToken, logout } from "../services/api"
import styles from "../styles/SessionTimeoutDialog.module.css"

const SessionTimeoutDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [countdown, setCountdown] = useState(60) // 60 seconds countdown
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleStay = useCallback(async () => {
    try {
      setIsRefreshing(true)
      await refreshToken()
      setIsOpen(false)
      setCountdown(60)
    } catch (error) {
      console.error("No se pudo actualizar el token:", error)
      handleLogout()
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Function to handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error durante el cierre de sesión:", error)
    } finally {
      window.location.href = "/login"
    }
  }, [])

  // Listen for session timeout event
  useEffect(() => {
    const handleSessionTimeout = () => {
      console.log("Session timeout detected")
      setIsOpen(true)
      setCountdown(60)
    }

    window.addEventListener("session_timeout", handleSessionTimeout)

    return () => {
      window.removeEventListener("session_timeout", handleSessionTimeout)
    }
  }, [])

  useEffect(() => {
    let timer
    if (isOpen && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else if (isOpen && countdown === 0) {
      handleLogout()
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isOpen, countdown, handleLogout])

  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h2 className={styles.title}>Session Timeout</h2>
        <p className={styles.message}>
          Tu sesión está a punto de expirar por inactividad. ¿Quieres seguir trabajando?
        </p>
        <p className={styles.countdown}>
         La sesión expirará en <span className={styles.timer}>{countdown}</span> segundos.
        </p>
        <div className={styles.actions}>
          <button className={styles.stayButton} onClick={handleStay} disabled={isRefreshing}>
            {isRefreshing ? "Refreshing..." : "Continuar Sesion"}
          </button>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionTimeoutDialog

