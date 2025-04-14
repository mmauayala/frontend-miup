import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "ngrok-skip-browser-warning": "true", 
    "Content-Type": "application/json",
  },
})

export const SESSION_TIMEOUT_EVENT = "session_timeout"

export const emitSessionTimeout = () => {
  const event = new CustomEvent(SESSION_TIMEOUT_EVENT)
  window.dispatchEvent(event)
}

api.interceptors.request.use((request) => {
  console.log("Solicitud de inicio", JSON.stringify(request, null, 2))
  return request
})

api.interceptors.response.use((response) => {
  console.log("Response:", JSON.stringify(response, null, 2))
  return response
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
    const response = await api.post("/autenticacion/usuarios/login", { username, password });

    if (!response.data || !response.data.isSuccess || !response.data.response) {
      throw new Error("Error de inicio de sesión: formato de respuesta no válido");
    }

    const responseData = response.data.response;
    if (!responseData.accessToken || !responseData.refreshToken) {
      throw new Error("Error de inicio de sesión: faltan tokens en la respuesta");
    }

    const userType = await getUserType(username);
    const userData = {
      accessToken: responseData.accessToken,
      refreshToken: responseData.refreshToken,
      expiresIn: responseData["access token expira en"] || responseData.accessTokenExpiresAt,
      username: username,
      userType: userType,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    return userData;

  } catch (error) {
    throw error;
  }
}

export const logout = async () => {
  const user = getCurrentUser();
  if (!user) return;

  try {
    await api.post("/autenticacion/usuarios/logout", {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    });
  } catch (error) {
    console.error("Logout error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  } finally {
    localStorage.removeItem("user");
  }
}

export const register = async (username, password, role = "user") => {
  try {
    const response = await api.post("/usuarios/register", { username, password, role });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const refreshToken = async () => {
  const user = getCurrentUser();
  if (!user?.refreshToken) {
    emitSessionTimeout();
    throw new Error("Refresh token no disponible");
  }

  try {
    const response = await api.post("/autenticacion/usuarios/refresh-token", null, {
      params: { token: user.refreshToken },
    });

    const newAccessToken = response.data.accessToken || response.data.response?.accessToken;
    if (!newAccessToken) {
      throw new Error("No hay token de acceso en la respuesta");
    }

    user.accessToken = newAccessToken;
    localStorage.setItem("user", JSON.stringify(user));
    return newAccessToken;

  } catch (error) {
    emitSessionTimeout();
    throw error;
  }
}

api.interceptors.request.use(
  (config) => {
    const user = getCurrentUser();
    if (user?.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!originalRequest.url.includes("/refresh-token")) {
        try {
          const newAccessToken = await refreshToken();
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          emitSessionTimeout();
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
)

export const getProducts = async () => {
  try {
    const response = await api.get("/productos/lista");
    return response.data.content;
  } catch (error) {
    throw error; 
  }
}

export const getStockList = async () => {
  try {
    const response = await api.get("/productos/lista/stock");
    return response.data.map((item) => ({
      ...item,  
      producto: item.producto?.name || item.producto,  
    }));
  } catch (error) {
    throw error;  
  }
}

export const getMovementHistory = async () => {
  try {
    const response = await api.get("/productos/movimientos");
    return response.data; 
  } catch (error) {
    throw error; 
  }
}

export const createProduct = async (productData) => {
  try {
    const response = await api.post("/productos/create", productData);
    return response.data; 
  } catch (error) {
    throw error; 
  }
}

export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/productos/${id}`, productData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/productos/${id}`)
    return response.data
  } catch (error) {
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
    throw error
  }
}

export const makeSale = async (saleData) => {
  try {
    const response = await api.post("/productos/venta", saleData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/productos/${productId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getProductIdByName = async (productName) => {
  try {
    const response = await api.get(`/productos/obtener-id/${encodeURIComponent(productName)}`)
    return response.data.id
  } catch (error) {
    throw error
  }
}

export const addStock = async (productId, stockData) => {
  try {
    const response = await api.post(`/productos/${productId}/stock`, stockData)
    return {
      ...response.data,
      producto: response.data.producto.name,
    }
  } catch (error) {
    throw error
  }
}

export default api

