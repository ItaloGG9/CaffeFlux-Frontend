import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AbrirTurno() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [fondo, setFondo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const API_URL = process.env.REACT_APP_API_URL;

  const abrirTurno = async () => {
    if (!nombre) {
      setMensaje("⚠️ Ingresa tu nombre antes de abrir el turno.");
      return;
    }
    try {
      // 🟢 CAMBIO CLAVE: Enviamos la hora de apertura en formato ISO (UTC)
      const res = await axios.post(`${API_URL}/api/turnos/open`, {
        usuario_responsable: nombre,
        fondo_inicial: parseFloat(fondo) || 0,
        hora_apertura: new Date().toISOString(), // 👈 Envía la hora UTC explícitamente
      });
      
      // Una vez que el backend reciba la hora con zona horaria, 
      // debería registrarla correctamente y el frontend (CerrarDia.jsx)
      // podrá interpretarla correctamente con el sufijo 'Z'.

      setMensaje(`✅ Turno abierto correctamente (${res.data.usuario_responsable})`);
    } catch (err) {
      console.error(err);
      // Manejo de errores más descriptivo si el backend proporciona detalles
      const errorDetail = err.response?.data?.detail || "Error desconocido al abrir el turno.";
      setMensaje(`❌ Error al abrir el turno: ${errorDetail}`);
    }
  };

  return (
    <div style={styles.container}>
      <h1>🔓 Abrir Turno</h1>
      <p>Registra tu nombre y el fondo inicial para comenzar el día.</p>

      <input
        type="text"
        placeholder="Tu nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={styles.input}
      />

      <input
        type="number"
        placeholder="Fondo inicial (opcional)"
        value={fondo}
        onChange={(e) => setFondo(e.target.value)}
        style={styles.input}
      />

      <button onClick={abrirTurno} style={styles.button}>
        ✅ Registrar Turno
      </button>

      {mensaje && <p style={mensaje.startsWith('❌') ? {color: 'red'} : {color: 'green', fontWeight: 'bold'}}>{mensaje}</p>}

      <button onClick={() => navigate("/turnos")} style={styles.volver}>
        ⬅️ Volver
      </button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#e7c09bcb",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    textAlign: "center",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "250px",
  },
  button: {
    backgroundColor: "#96491d98",
    color: "white",
    padding: "10px 25px",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },
  volver: {
    marginTop: 20,
    backgroundColor: "#6b4b34a8",
    color: "white",
    padding: "8px 20px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};