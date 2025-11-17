import React from "react";
import { useNavigate } from "react-router-dom";

export default function Turnoindex() {
  const navigate = useNavigate();

  const goTo = (path) => navigate(path);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#e7c09bcb",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 40 }}>🕓 Gestión de Turnos</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <button
          onClick={() => goTo("/turnos/abrir")}
          style={buttonStyle}
        >
          🔓 Abrir Turno
        </button>

        <button
          onClick={() => goTo("/turnos/cerrar")}
          style={buttonStyle}
        >
          🔒 Cerrar Turno
        </button>

        <button
          onClick={() => goTo("/turnos/ver")}
          style={buttonStyle}
        >
          📋 Ver Registros
        </button>

        <button
          onClick={() => goTo("/")}
          style={{ ...buttonStyle, backgroundColor: "#6b4b34a8" }}
        >
          ⬅️ Volver al Inicio
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  fontSize: "1.2rem",
  padding: "15px 30px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#96491d98", // café con transparencia
  color: "white",
  width: "250px",
  transition: "0.3s",
  fontWeight: "bold",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
};
