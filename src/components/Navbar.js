import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.js"; // opcional si luego deseas estilos separados

export default function Navbar() {
  return (
    <nav style={{
      backgroundColor: "#2c2c2c",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 30px"
    }}>
      <h2>CafféFlux</h2>
      <div>
        <Link to="/" style={linkStyle}>Inicio</Link>
        <Link to="/turno" style={linkStyle}>Gestión Turno</Link>
        <Link to="/productos" style={linkStyle}>Productos</Link>
        <Link to="/ventas" style={linkStyle}>Ventas</Link>
        <Link to="/reportes" style={linkStyle}>Reportes</Link>
        <Link to="/configuracion" style={linkStyle}>Configuración</Link>
      </div>
    </nav>
  );
}

const linkStyle = {
  color: "white",
  marginRight: "15px",
  textDecoration: "none",
  fontWeight: "bold"
};
