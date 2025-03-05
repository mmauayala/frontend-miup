import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./styles/theme.css";

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  document.documentElement.setAttribute("data-theme", currentTheme === "dark" ? "light" : "dark");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
