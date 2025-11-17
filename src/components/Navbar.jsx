// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ background: "#222", color: "#fff", padding: "10px" }}>
      <Link to="/" style={{ color: "white", marginRight: 20 }}>Inicio</Link>
      <Link to="/turnos" style={{ color: "white", marginRight: 20 }}>Turnos</Link>
      <Link to="/ventas" style={{ color: "white", marginRight: 20 }}>Ventas</Link>
      <Link to="/admin" style={{ color: "white" }}>Administración</Link>
    </nav>
  );
}
