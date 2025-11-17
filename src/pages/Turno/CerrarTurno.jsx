// src/pages/Turno/CerrarTurno.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🟢 Función auxiliar para formatear la hora (Corrige el desfase de 12 horas)
const formatTimeDisplay = (time) => {
    if (!time) return "N/A";
    try {
        // Si la cadena no termina en 'Z' (UTC), la añadimos para forzar la interpretación como UTC.
        const dateString = String(time).endsWith('Z') ? time : time + 'Z';
        
        // Muestra la fecha y hora locales del usuario (ej: 17/11/2025, 20:22:46)
        return new Date(dateString).toLocaleString('es-CL', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Puedes usar true si prefieres AM/PM
        });
    } catch (e) {
        return "Error de formato";
    }
};


export default function CerrarTurno() {
  const [turnos, setTurnos] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  // 🔔 ESTADOS PARA GESTIONAR LA UI
  const [modalConfirm, setModalConfirm] = useState(null); // { id_turno, usuario } para el modal
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '...' } para el mensaje flotante

  // Función para mostrar y ocultar la notificación
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000); // Ocultar después de 3 segundos
  };

  // 🔹 Cargar turnos abiertos
  useEffect(() => {
    axios
      .get(`${API_URL}/api/turnos/`)
      .then((res) => {
        const abiertos = res.data.filter((t) => t.hora_cierre === null);
        setTurnos(abiertos);
      })
      .catch((err) => console.error("Error cargando turnos:", err));
  }, [API_URL]);

  // 🔹 1. Inicia el flujo de cierre (muestra el modal)
  const handleConfirmClose = (id_turno, usuario) => {
    setModalConfirm({ id_turno, usuario });
  };

  // 🔹 2. Ejecuta la acción de cierre (se llama desde el modal)
  const executeClose = () => {
    if (!modalConfirm) return; // Seguridad
    const { id_turno, usuario } = modalConfirm;
    
    setModalConfirm(null); // Cierra el modal inmediatamente

    axios
      .post(`${API_URL}/api/turnos/close`, {
        id_turno,
        usuario_cierre: usuario,
        // 🟢 IMPORTANTE: Si el backend requiere hora_cierre, también deberías enviarla aquí
        // hora_cierre: new Date().toISOString(), 
      })
      .then(() => {
        showNotification("success", `✅ Turno de ${usuario} cerrado correctamente.`);
        // Filtra el turno cerrado de la lista
        setTurnos((prev) => prev.filter((t) => t.id_turno !== id_turno));
      })
      .catch((err) => {
        console.error("Error cerrando turno:", err);
        const errorMsg = err.response?.data?.detail || "Error al cerrar el turno.";
        showNotification("error", `❌ ${errorMsg}`);
      });
  };

  return (
    <div style={styles.container}>
      
      {/* 🔔 NOTIFICACIÓN FLOTANTE */}
      {notification && (
        <div 
          style={{ 
            ...styles.notification, 
            ...(notification.type === 'error' ? styles.notificationError : styles.notificationSuccess) 
          }}
        >
          {notification.message}
        </div>
      )}

      <h1>🔒 Cerrar Turno</h1>
      <p>Selecciona un turno abierto para cerrarlo.</p>

      {turnos.length === 0 ? (
        <p style={{ marginTop: 20 }}>No hay turnos abiertos actualmente.</p>
      ) : (
        <div style={styles.turnosBox}>
          {turnos.map((t) => (
            <div key={t.id_turno} style={styles.turnoCard}>
              <p><strong>👤 Responsable:</strong> {t.usuario_responsable}</p>
              <p>
                <strong>🕓 Apertura:</strong> 
                {/* 🟢 APLICACIÓN DE LA FUNCIÓN DE FORMATO CORREGIDA */}
                {formatTimeDisplay(t.hora_apertura)}
              </p>
              <button
                style={styles.cerrarBtn}
                onClick={() => handleConfirmClose(t.id_turno, t.usuario_responsable)}
              >
                🔒 Cerrar Turno
              </button>
            </div>
          ))}
        </div>
      )}

      <button style={styles.volverBtn} onClick={() => navigate("/turnos")}>
        ⬅️ Volver
      </button>

      {/* 🔹 MODAL DE CONFIRMACIÓN */}
      {modalConfirm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>¿Estás seguro?</h2>
            <p style={{ margin: "20px 0" }}>
              Confirma que deseas cerrar el turno de **{modalConfirm.usuario}**.
            </p>
            <div style={styles.modalActions}>
              <button
                style={styles.modalCancelBtn}
                onClick={() => setModalConfirm(null)} 
              >
                Cancelar
              </button>
              <button
                style={styles.modalConfirmBtn}
                onClick={executeClose} 
              >
                Sí, Cerrar Turno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#e7c09bcb",
    padding: 30,
    minHeight: "100vh",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    position: 'relative', 
  },
  turnosBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "center",
    marginTop: 20,
  },
  turnoCard: {
    backgroundColor: "#e7aa71cb",
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    padding: 20,
    width: 280,
    textAlign: "left",
  },
  cerrarBtn: {
    backgroundColor: "#96491d98",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: 10,
  },
  volverBtn: {
    backgroundColor: "#6b4b34a8",
    color: "white",
    padding: "10px 25px",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: 25,
  },
  
  // 🎨 ESTILOS PARA LA NOTIFICACIÓN (TOAST)
  notification: {
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '15px 30px',
    borderRadius: 10,
    color: 'white',
    zIndex: 1010,
    fontSize: '1.1rem',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  },
  notificationSuccess: {
    backgroundColor: '#4CAF50', // Verde para éxito
  },
  notificationError: {
    backgroundColor: '#F44336', // Rojo para error
  },

  // 🎨 ESTILOS PARA EL MODAL DE CONFIRMACIÓN
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#f0ad6fbd",
    borderRadius: 15,
    padding: 30,
    width: "90%",
    maxWidth: 400,
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.4)",
    textAlign: "center",
  },
  modalActions: {
    marginTop: 20,
    display: "flex",
    justifyContent: "space-around",
    gap: 15,
  },
  modalConfirmBtn: {
    backgroundColor: "#4dd86b98",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    flex: 1,
  },
  modalCancelBtn: {
    backgroundColor: "#fc4242ff",
    color: "#333",
    padding: "10px 15px",
    border: "1px solid #aaa",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    flex: 1,
  },
};