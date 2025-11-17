import React from "react";
import { useNavigate } from "react-router-dom";

export default function Adminindex() {
  const navigate = useNavigate();

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
      <h1 style={{ marginBottom: 40, color: "#3e2723" }}>⚙️ Panel de Administración</h1>
      <p style={{ marginBottom: 30 }}>
        Desde aquí podrás revisar las ventas totales, turnos activos y cerrar el día.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <button
          onClick={() => navigate("/admin/ventas")}
          style={buttonStyle}
        >
          📊 Ventas Totales
        </button>

        <button
          onClick={() => navigate("/admin/turnos")}
          style={buttonStyle}
        >
          🕒 Turnos Activos
        </button>

        <button
          onClick={() => navigate("/admin/cerrar")}
          style={buttonStyle}
        >
          📅 Cerrar Día
        </button>
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          ...buttonStyle,
          marginTop: 40,
          backgroundColor: "#6b4b34a8",
        }}
      >
        ⬅️ Volver al Inicio
      </button>
    </div>
  );
}

const buttonStyle = {
  fontSize: "1.2rem",
  padding: "15px 30px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#96491dbf",
  color: "white",
  width: "260px",
  transition: "0.3s",
  fontWeight: "bold",
};
