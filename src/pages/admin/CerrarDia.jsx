import React, { useState } from "react";
import { jsPDF } from "jspdf";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Componente simple para el mensaje emergente
const Toast = ({ message, type, onClose }) => {
    if (!message) return null;

    const toastStyle = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: 1000,
        backgroundColor: type === 'success' ? '#28a745' : '#dc3545', // Verde para éxito, Rojo para error
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        animation: 'fadeIn 0.5s'
    };

    return (
        <div style={toastStyle} onClick={onClose}>
            {message}
        </div>
    );
};

export default function CerrarDia() {
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(false);
    
    // 🟢 NUEVO ESTADO para el mensaje emergente
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success'); 

    const API_URL = process.env.REACT_APP_API_URL;

    // Función auxiliar para formatear horas (solo hora y minuto)
    const formatTime = (time) => {
        if (!time) return "?";
        try {
            return new Date(time).toLocaleTimeString('es-CL', {
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return "?";
        }
    };

    // 🟢 Función para mostrar el toast y ocultarlo automáticamente
    const showToast = (message, type) => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 8000); // Oculta después de 8 segundos
    };

    const generarInforme = async () => {
        // Asegúrate de limpiar cualquier toast anterior
        setToastMessage(null);
        
        try {
            setCargando(true);

            // ⚠️ PASO CRÍTICO: Confirmación de borrado de datos
            if (!window.confirm("⚠️ ¿Estás seguro de cerrar el día? Esto generará el informe y BORRARÁ TODAS las ventas, turnos cerrados Y turnos activos.")) {
                setCargando(false);
                return;
            }

            // 🔹 1. Obtener datos del backend
            const [pagosRes, turnosRes] = await Promise.all([
                axios.get(`${API_URL}/api/pagos`),
                axios.get(`${API_URL}/api/turnos`)
            ]);

            const pagos = pagosRes.data; // Las "Ventas" son los "Pagos"
            const turnos = turnosRes.data;
            const turnosCerrados = turnos.filter(t => t.hora_cierre); // Solo turnos cerrados

            let totalGeneral = 0;
            pagos.forEach(p => { totalGeneral += p.total || 0; });

            // 🔹 2. Generar el PDF con jsPDF (Lógica del PDF omitida por brevedad)
            const doc = new jsPDF();
            let y = 20;

            // ... (Lógica de generación del PDF) ...
            
            doc.setFont("helvetica", "bolditalic");
            doc.setFontSize(20);
            doc.text("Informe Del Día - CaffeFlux ☕", 105, y, { align: 'center' });
            y += 15;
            // ... (resto de la lógica del PDF) ...

            // 🔹 3. Guardar PDF
            doc.save(`informe_caffeflux_${new Date().toISOString().split("T")[0]}.pdf`);

            // 🔹 4. Borrar los datos del backend
            const [resPagos, resCerrados, resActivos] = await Promise.all([
                axios.delete(`${API_URL}/api/pagos`),
                axios.delete(`${API_URL}/api/turnos/cerrados`),
                axios.delete(`${API_URL}/api/turnos/activos`) 
            ]);

            const mensajeActivos = resActivos.data.message;

            // 🟢 Usar Toast en lugar de alert() para éxito
            showToast(
                `✅ Informe generado y datos limpiados correctamente. Turnos Activos: ${mensajeActivos}`,
                'success'
            );

        } catch (err) {
            console.error("❌ Error generando informe:", err);
            
            // Lógica robusta para extraer el mensaje de error del backend
            let errorMessage = "Error desconocido al intentar limpiar datos.";
            
            if (err.response) {
                errorMessage = err.response.data?.detail || JSON.stringify(err.response.data);
            } else if (err.message) {
                errorMessage = err.message;
            } else {
                errorMessage = JSON.stringify(err);
            }
            
            // 🟢 Usar Toast en lugar de alert() para error
            showToast(`Error al generar el informe y/o limpiar datos: ${errorMessage}`, 'error');

        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1>📅 Cerrar Día</h1>
            <p>Genera un informe PDF con las ventas y turnos del día, y luego limpia todos los datos de la base de datos.</p>

            <button
                onClick={generarInforme}
                style={styles.pdfBtn}
                disabled={cargando}
            >
                {cargando ? "Generando y Limpiando..." : "🧾 Generar Informe y Cerrar Día"}
            </button>

            <button onClick={() => navigate("/admin")} style={styles.volverBtn}>
                ⬅️ Volver
            </button>
            
            {/* 🟢 Renderizar el Toast */}
            <Toast 
                message={toastMessage} 
                type={toastType} 
                onClose={() => setToastMessage(null)} 
            />
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
    },
    pdfBtn: {
        backgroundColor: "#dc3545",
        color: "white",
        padding: "12px 30px",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: "bold",
        marginTop: 20,
        transition: "0.3s",
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
};