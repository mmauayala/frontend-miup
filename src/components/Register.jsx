import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

import styles from '../styles/AuthForm.module.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(username, password)
      navigate("/login")
    } catch (error) {
      console.error("Registration failed:", error)
    }
  }

  return (
    <div className={styles.container}>
      <h2>REGISTRARSE</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Registrarse</button>
      </form>
      <Link to="/login" className={styles.link}>
        ¿Ya tienes una cuenta? Iniciar sesión
      </Link>
    </div>
  );
};

export default Register;