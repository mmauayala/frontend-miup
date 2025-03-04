import axios from "axios"

const API_URL = "http://localhost:9191/v1"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user")
  if (userStr) {
    return JSON.parse(userStr)
  }
  return null
}

export const getUserType = async (username) => {
  try {
    const response = await api.get(`/usuarios/${username}`)
    return response.data.userType
  } catch (error) {
    throw error
  }
}

export const login = async (username, password) => {
  try {
    const response = await api.post("/autenticacion/usuarios/login", { username, password })
    console.log("Full login response:", JSON.stringify(response.data, null, 2))

    if (response.data && response.data.isSuccess && response.data.response) {
      const responseData = response.data.response
      console.log("Response data:", responseData)

      if (responseData.accessToken && responseData.refreshToken) {
        const userType = await getUserType(username)
        const userData = {
          accessToken: responseData.accessToken,
          refreshToken: responseData.refreshToken,
          expiresIn: responseData["access token expires in"] || responseData.accessTokenExpiresAt,
          username: username,
          userType: userType,
        }

        localStorage.setItem("user", JSON.stringify(userData))

        return userData
      } else {
        console.error("Error de inicio de sesión: faltan tokens en la respuesta")
        throw new Error("Error de inicio de sesión: faltan tokens en la respuesta")
      }
    } else {
      console.error("Error de inicio de sesión: formato de respuesta no válido", response.data)
      throw new Error("Error de inicio de sesión: formato de respuesta no válido")
    }
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export const logout = async () => {
  const user = getCurrentUser()
  if (user) {
    try {
      const response = await api.post("/autenticacion/usuarios/logout", {
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      })
      console.log("Logout response:", response)
    } catch (error) {
      console.error("Logout error:", error)
      if (error.response) {
        console.error("Error data:", error.response.data)
        console.error("Error status:", error.response.status)
        console.error("Error headers:", error.response.headers)
      } else if (error.request) {
        console.error("No response received:", error.request)
      } else {
        console.error("Error message:", error.message)
      }
    }
  }
  localStorage.removeItem("user")
}

export const register = async (username, password, role = "user") => {
  try {
    const response = await api.post("/usuarios/register", { username, password, role })
    console.log("Registration response:", response)
    return response.data
  } catch (error) {
    console.error("Registration error:", error)
    if (error.response) {
      console.error("Error data:", error.response.data)
      console.error("Error status:", error.response.status)
    }
    throw error
  }
}

export const refreshToken = async () => {
  const user = getCurrentUser()
  if (user && user.refreshToken) {
    try {
      const response = await axios.post(`${API_URL}/usuarios/refresh-token`, null, {
        params: { token: user.refreshToken },
      })
      const newAccessToken = response.data.accessToken
      user.accessToken = newAccessToken
      localStorage.setItem("user", JSON.stringify(user))
      return newAccessToken
    } catch (error) {
      console.error("Token refresh failed:", error)
      throw error
    }
  }
  throw new Error("No refresh token available")
}

api.interceptors.request.use(
  (config) => {
    const user = getCurrentUser()
    if (user && user.accessToken) {
      config.headers["Authorization"] = "Bearer " + user.accessToken
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    try {
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        const newAccessToken = await refreshToken()
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`
        return api(originalRequest)
      }
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError)
      // If refresh fails, redirect to login
      window.location.href = "/login"
      return Promise.reject(refreshError)
    }
    return Promise.reject(error)
  },
)

export const getProducts = async () => {
  try {
    // Realiza la solicitud HTTP GET
    const response = await api.get("/productos/lista");

    // Devuelve solo el array de productos (content)
    return response.data.content;
  } catch (error) {
    console.error("Error obteniendo productos:", error);

    // Manejo de errores
    if (error.response) {
      console.error("Error data:", error.response.data);
      console.error("Error status:", error.response.status);
    }

    // Lanza el error para que pueda ser manejado por el código que llama a esta función
    throw error;
  }
}

export const getStockList = async () => {
  try {
    const response = await api.get("/productos/lista/stock")
    return response.data.map((item) => ({
      ...item,
      producto: item.producto.name,
    }))
  } catch (error) {
    console.error("Error obteniendo lista de existencias:", error)
    if (error.response) {
      console.error("Error data:", error.response.data)
      console.error("Error status:", error.response.status)
    }
    throw error
  }
}

export const getMovementHistory = async () => {
  try {
    const response = await api.get("/productos/movimientos")
    return response.data
  } catch (error) {
    console.error("Error obteniendo historial de movimientos:", error)
    if (error.response) {
      console.error("Error data:", error.response.data)
      console.error("Error status:", error.response.status)
    }
    throw error
  }
}

export const createProduct = async (productData) => {
  try {
    const response = await api.post("/productos/create", productData)
    return response.data
  } catch (error) {
    console.error("Error al crear el producto:", error)
    throw error
  }
}

export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/productos/${id}`, productData)
    return response.data
  } catch (error) {
    console.error("Error al editar el producto:", error)
    throw error
  }
}

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/productos/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al borrar el producto:", error)
    throw error
  }
}

export const getPromotionsList = async () => {
  try {
    const response = await api.get("/productos/promociones/lista")
    return response.data.map((promotion) => ({
      ...promotion,
      producto: promotion.producto.name,
    }))
  } catch (error) {
    console.error("Error al obtener la lista de promociones:", error)
    if (error.response) {
      console.error("Error data:", error.response.data)
      console.error("Error status:", error.response.status)
    }
    throw error
  }
}

export const getWasteHistory = async (productId) => {
  try {
    const response = await api.get(`/productos/${productId}/desperdicios`)
    return response.data.map((waste) => ({
      ...waste,
      producto: waste.producto.name,
    }))
  } catch (error) {
    console.error("Error al obtener el historial de residuos:", error)
    if (error.response) {
      console.error("Error data:", error.response.data)
      console.error("Error status:", error.response.status)
    }
    throw error
  }
}

export const enterWaste = async (productId, cantidad) => {
  try {
    const response = await api.post(`/productos/${productId}/desperdicios`, { cantidad })
    return {
      ...response.data,
      producto: response.data.producto.name
    }
  } catch (error) {
    console.error("Error al introducir los residuos:", error)
    if (error.response) {
      console.error("Error data:", error.response.data)
      console.error("Error status:", error.response.status)
    }
    throw error
  }
}

export const createPromotion = async (promotionData) => {
  try {
    const response = await api.post("/productos/promociones/create", promotionData)
    return {
      ...response.data,
      producto: response.data.producto.name,
    }
  } catch (error) {
    console.error("Error al crear la promoción:", error)
    if (error.response) {
      console.error("Error data:", error.response.data)
      console.error("Error status:", error.response.status)
    }
    throw error
  }
}

export const updatePromotionStatus = async (id, activa) => {
  try {
    const response = await api.patch(`/productos/promociones/${id}/estado?activa=${activa}`)
    return {
      ...response.data,
      producto: response.data.producto.name,
    }
  } catch (error) {
    console.error("Error al actualizar el estado de la promoción:", error)
    if (error.response) {
      console.error("Error data:", error.response.data)
      console.error("Error status:", error.response.status)
    }
    throw error
  }
}

export const makeSale = async (saleData) => {
  try {
    const response = await api.post("/productos/venta", saleData)
    console.log("Respuesta de la venta:", JSON.stringify(response.data, null, 2))
    return response.data
  } catch (error) {
    console.error("Error al realizar la venta:", error)
    if (error.response) {
      console.error("Error response:", JSON.stringify(error.response.data, null, 2))
      console.error("Error status:", error.response.status)
      console.error("Error headers:", JSON.stringify(error.response.headers, null, 2))
    } else if (error.request) {
      console.error("No se recibió respuesta:", error.request)
    } else {
      console.error("Error details:", error.message)
    }
    throw error
  }
}

// Add a new function to get product by ID
export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/productos/${productId}`)
    return response.data
  } catch (error) {
    console.error(`Error al obtener el ID del producto para ${productId}:`, error)
    throw error
  }
}

// Add this new function to get product ID by name
export const getProductIdByName = async (productName) => {
  try {
    const response = await api.get(`/productos/obtener-id/${encodeURIComponent(productName)}`)
    return response.data.id
  } catch (error) {
    console.error(`Error al obtener el ID del producto para ${productName}:`, error)
    throw error
  }
}

// Add stock to a product
export const addStock = async (productId, stockData) => {
  try {
    const response = await api.post(`/productos/${productId}/stock`, stockData)
    return {
      ...response.data,
      producto: response.data.producto.name,
    }
  } catch (error) {
    console.error(`Error al agregar stock al producto ${productId}:`, error)
    if (error.response) {
      console.error("Error data:", error.response.data)
      console.error("Error status:", error.response.status)
    }
    throw error
  }
}

export default api

