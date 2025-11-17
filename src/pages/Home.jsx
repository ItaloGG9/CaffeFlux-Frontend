import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
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
      }}
    >
      <h1 style={{ marginBottom: 40 }}>☕ Bienvenido a CaffeFlux</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <button
          onClick={() => goTo("/turnos")}
          style={buttonStyle}
        >
          🕓 Iniciar Turno
        </button>

        <button
          onClick={() => goTo("/ventas")}
          style={buttonStyle}
        >
          💸 Ventas
        </button>

        <button
          onClick={() => goTo("/admin")}
          style={buttonStyle}
        >
          ⚙️ Administración
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
  backgroundColor: "#96491d98",
  color: "white",
  width: "250px",
  transition: "0.3s",
  fontWeight: "bold",
};
