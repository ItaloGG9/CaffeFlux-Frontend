import React, { useState } from "react";

export default function GestionTurno() {
  const [turnoAbierto, setTurnoAbierto] = useState(false);
  const [turnoInfo, setTurnoInfo] = useState({
    id: "CFFLU21052025UX",
    fecha: "Lunes, 28 Abril de 2025",
    comentarios: ""
  });

  return (
    <div style={container}>
      <h2>Gestión de Turno</h2>
      {!turnoAbierto ? (
        <div style={card}>
          <p>No hay turno abierto actualmente.</p>
          <button style={btn} onClick={() => setTurnoAbierto(true)}>Abrir Turno</button>
        </div>
      ) : (
        <div style={card}>
          <h3>Turno Actual</h3>
          <p><strong>ID:</strong> {turnoInfo.id}</p>
          <p><strong>Fecha:</strong> {turnoInfo.fecha}</p>
          <p><strong>Comentarios:</strong> {turnoInfo.comentarios || "Ninguno"}</p>
          <button style={btnCerrar} onClick={() => setTurnoAbierto(false)}>Cerrar Turno</button>
        </div>
      )}
    </div>
  );
}

const container = { textAlign: "center", marginTop: 30 };
const card = { border: "1px solid #ccc", padding: 20, borderRadius: 10, display: "inline-block", minWidth: 300 };
const btn = { backgroundColor: "#4caf50", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" };
const btnCerrar = { ...btn, backgroundColor: "#f44336" };
