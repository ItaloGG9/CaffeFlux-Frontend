import React, { useState } from "react";
import { jsPDF } from "jspdf";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Componente simple para el mensaje de Resultado (Banner Superior)
const Toast = ({ message, type, onClose }) => {
    if (!message) return null;

    const toastStyle = {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '15px 30px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: 2000,
        backgroundColor: type === 'success' ? '#28a745' : '#dc3545',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
        textAlign: 'center',
    };

    return (
        <div style={toastStyle} onClick={onClose}>
            {message}
        </div>
    );
};

// 🟢 MODIFICACIÓN: Mensaje adaptado para el "Cierre Lógico" (Cerrar Turnos)
const ConfirmModal = ({ onConfirm, onCancel }) => {
    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <p style={modalStyles.message}>
                    ⚠️ **¿Estás seguro de cerrar el día?** Esto generará el PDF y **CERRARÁ TODOS LOS TURNOS ACTIVOS** para resetear los contadores diarios. Los datos se guardarán en MongoDB.
                </p>
                <div style={modalStyles.actions}>
                    <button style={modalStyles.cancelBtn} onClick={onCancel}>
                        Cancelar
                    </button>
                    <button style={modalStyles.confirmBtn} onClick={onConfirm}>
                        Aceptar y Cerrar Turnos
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function CerrarDia() {
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(false);

    // ESTADO para el mensaje de resultado (Toast superior)
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success');

    // ESTADO para la Confirmación (Modal)
    const [showConfirm, setShowConfirm] = useState(false);

    // Asegúrate de que API_URL está definido
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000"; 

    // Función auxiliar para formatear horas (solo hora y minuto)
    const formatTime = (time) => {
        if (!time) return "?";
        try {
            const dateString = String(time).endsWith('Z') ? time : time + 'Z';

            return new Date(dateString).toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // Formato 24 horas para mayor claridad
            });
        } catch (e) {
            return "?";
        }
    };

    // Función para mostrar el toast y ocultarlo automáticamente
    const showToast = (message, type) => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 8000);
    };

    // Lógica de la confirmación: Se llama al hacer click en el botón principal
    const handleCerrarDiaClick = () => {
        setToastMessage(null);
        setShowConfirm(true);
    };

    // Lógica principal de ejecución: Se llama si se acepta el modal
    const generarInforme = async () => {
        setShowConfirm(false); // Oculta el modal

        try {
            setCargando(true);

            // 🔹 1. Obtener datos del backend (GETs)
            const [pagosRes, turnosRes] = await Promise.all([
                axios.get(`${API_URL}/api/pagos`),
                axios.get(`${API_URL}/api/turnos`)
            ]);

            const pagos = pagosRes.data;
            const turnos = turnosRes.data;
            // Solo incluimos turnos con hora_cierre para el informe
            const turnosCerrados = turnos.filter(t => t.hora_cierre); 

            let totalGeneral = 0;
            pagos.forEach(p => { totalGeneral += p.total || 0; });

            // 🔹 2. Generar el PDF con jsPDF
            const doc = new jsPDF();
            let y = 20; // Posición inicial vertical

            // === Título ===
            doc.setFont("helvetica", "bolditalic");
            doc.setFontSize(20);
            doc.text("Informe Del Día - CaffeFlux ☕", 105, y, { align: 'center' });
            y += 15;

            // === Información de Generación ===
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text("Fecha: " + new Date().toLocaleDateString(), 20, y);
            y += 7;
            doc.text("Generado a las: " + new Date().toLocaleTimeString(), 20, y);
            y += 15;

            // === Resumen de Ventas ===
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("Resumen de Ventas", 20, y);
            y += 10;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);

            let ventasDesglosadas = false;

            pagos.forEach((p) => {
                // ... (lógica de desglose de ventas para el PDF - se mantiene igual) ...
                 if (p.productos && p.productos.length > 0) {
                    ventasDesglosadas = true;
                    p.productos.forEach(prod => {
                        doc.text(`- ${prod.nombre} x${prod.cantidad}: $${(prod.precio_unitario * prod.cantidad).toFixed(2)}`, 25, y);
                        y += 7; 
                    });
                } else {
                    doc.text(`- Venta sin productos registrados: $${(p.total || 0).toFixed(2)}`, 25, y);
                    y += 7;
                    ventasDesglosadas = true;
                }
            });

            if (!ventasDesglosadas && pagos.length === 0) {
                doc.text("No se registraron ventas en este período.", 25, y);
                y += 15;
            } else {
                 y += 5;
            }


            // Separador y Total
            doc.setFont("helvetica", "bold");
            doc.text(`TOTAL DEL DÍA: $${totalGeneral.toFixed(2)}`, 20, y);
            y += 15;


            // === Turnos Cerrados ===
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("Turnos Cerrados:", 20, y);
            y += 10;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);

            if (turnosCerrados.length > 0) {
                turnosCerrados.forEach((t) => {
                    const inicio = formatTime(t.hora_apertura);
                    const fin = formatTime(t.hora_cierre);

                    doc.text(
                        `Empleado: ${t.usuario_responsable || 'Desconocido'} | inicio: ${inicio} | fin: ${fin}`,
                        25,
                        y
                    );
                    y += 7;
                });
            } else {
                doc.text("No hay turnos cerrados registrados.", 25, y);
                y += 7;
            }

            // 🔹 3. Guardar PDF
            doc.save(`informe_caffeflux_${new Date().toISOString().split("T")[0]}.pdf`);

            // 🟢 NUEVO PASO CRÍTICO: CERRAR LOS TURNOS ACTIVOS (Borrado Lógico)
            try {
                // Llama al endpoint de tu Backend para cerrar todos los turnos abiertos
                // ASEGÚRATE DE QUE TU BACKEND TIENE ESTE ENDPOINT IMPLEMENTADO COMO PUT
                const resCierre = await axios.put(`${API_URL}/api/turnos/cerrar_todos`);

                showToast(
                    `✅ Informe generado correctamente. ${resCierre.data.message || "Turnos cerrados para iniciar un nuevo día."}`,
                    'success'
                );

            } catch (errorCierre) {
                console.error("Error al cerrar turnos (PUT):", errorCierre);
                showToast("⚠️ Informe generado, pero hubo un error al cerrar los turnos. Revisa que el endpoint /api/turnos/cerrar_todos esté en tu backend.", 'error');
            }


        } catch (err) {
            console.error("❌ Error generando informe:", err);

            let errorMessage = "Error desconocido al intentar generar el informe.";

            if (err.response) {
                // Maneja el error 422, que podría venir de un GET si algo falla en el backend
                errorMessage = err.response.data?.detail || JSON.stringify(err.response.data);
            } else if (err.message) {
                errorMessage = err.message;
            } else {
                errorMessage = JSON.stringify(err);
            }

            showToast(`Error al generar el informe: ${errorMessage}`, 'error');

        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={styles.container}>

            {/* Toast de resultado (Banner de éxito/error) - Posición superior central */}
            <Toast
                message={toastMessage}
                type={toastType}
                onClose={() => setToastMessage(null)}
            />

            <h1>📅 Cerrar Día (Solo Informe)</h1>
            <p>Genera un informe PDF con las ventas y turnos del día. Cierra los turnos activos para resetear los contadores.</p>

            <button
                // LLAMA A LA FUNCIÓN QUE MUESTRA EL MODAL DE CONFIRMACIÓN
                onClick={handleCerrarDiaClick}
                style={styles.pdfBtn}
                disabled={cargando}
            >
                {cargando ? "Generando Informe..." : "🧾 Generar Informe"}
            </button>

            {/* Modal de Confirmación - Se muestra justo debajo del botón */}
            {showConfirm && (
                <ConfirmModal
                    onConfirm={generarInforme}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            <button onClick={() => navigate("/admin")} style={styles.volverBtn}>
                ⬅️ Volver
            </button>
        </div>
    );
}

// ... (El resto de los estilos se mantienen) ...

const styles = { /* ... */ };
const modalStyles = { /* ... */ };
