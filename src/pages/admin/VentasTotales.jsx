import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function VentasTotales() {
    const [pagos, setPagos] = useState([]);
    const [total, setTotal] = useState(0);
    // 🟢 NUEVO ESTADO para controlar la visibilidad del detalle
    const [mostrarDetalle, setMostrarDetalle] = useState(true); 
    const API_URL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        // 🛑 NOTA: Para que este contador se "resetee" al cerrar el día, 
        // la ruta /api/pagos DEBE ser modificada en el backend para solo devolver 
        // los pagos asociados a turnos activos.
        axios.get(`${API_URL}/api/pagos`)
            .then(res => {
                const pagosData = res.data;
                setPagos(pagosData);

                const suma = pagosData.reduce((acc, p) => acc + (p.total || 0), 0);
                setTotal(suma);
            })
            .catch(err => console.error("Error cargando pagos:", err));
    }, [API_URL]);

    // 🟢 Función para alternar la visibilidad del detalle
    const toggleDetalle = () => {
        setMostrarDetalle(!mostrarDetalle);
    };

    return (
        <div style={styles.container}>
            <h1>📊 Resumen de Ventas/Pagos</h1>
            <p>Total de ventas registradas en MongoDB.</p>

            {/* Título y Total del Día */}
            <div style={styles.totalBox}>
                <h2 style={{ margin: 0 }}>Total del Día:</h2>
                <h2 style={styles.totalAmount}>${total.toFixed(2)}</h2>
            </div>

            {/* Lista de Pagos - Renderizado CONDICIONAL */}
            {pagos.length === 0 ? (
                <p style={{ marginTop: 30, fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Aún no hay pagos registrados. 😥
                </p>
            ) : (
                // La tabla solo se renderiza si mostrarDetalle es true
                mostrarDetalle && (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.headerRow}>
                                <th style={styles.th}>ID Venta</th>
                                <th style={styles.th}>Método</th>
                                <th style={styles.th}>Productos Vendidos</th>
                                <th style={styles.th}>Total Venta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagos.map((p, i) => (
                                <tr key={p._id || i} style={styles.dataRow}>
                                    <td style={styles.td}>{i + 1}</td>
                                    <td style={styles.td}>{p.metodo_pago || 'N/A'}</td>

                                    <td style={styles.td}>
                                        {p.productos && p.productos.map(prod => (
                                            <div key={prod.id_producto || prod.nombre} style={styles.productItem}>
                                                <span style={styles.productName}>{prod.nombre}</span>
                                                <span style={styles.productDetails}>x{prod.cantidad} (${prod.precio_unitario})</span>
                                            </div>
                                        ))}
                                    </td>
                                    <td style={styles.tdTotal}>${p.total ? p.total.toFixed(2) : '0.00'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            )}
            
            {/* 🟢 NUEVO CONTENEDOR PARA LOS BOTONES: Ocultar y Volver */}
            <div style={styles.buttonContainer}>
                {pagos.length > 0 && (
                    <button onClick={toggleDetalle} style={styles.toggleBtn}>
                        {mostrarDetalle ? "Ocultar Detalle ⬆️" : "Mostrar Detalle ⬇️"}
                    </button>
                )}

                <button onClick={() => navigate("/admin")} style={styles.volverBtn}>
                    ⬅️ Volver
                </button>
            </div>
        </div>
    );
}

// ===================================
// 🎨 ESTILOS (Aseguran una mejor visualización)
// ===================================
const styles = {
    container: {
        backgroundColor: "#e7c09bcb",
        padding: 30,
        minHeight: "100vh",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
    },
    totalBox: {
        display: 'flex',
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
        marginTop: 20,
        padding: '15px 30px',
        backgroundColor: '#96491d98',
        color: 'white',
        borderRadius: 10,
        maxWidth: 400,
        margin: '20px auto',
    },
    totalAmount: {
        margin: 0,
        fontSize: '2rem',
        fontWeight: 'bold',
    },
    // 🟢 CONTENEDOR FLEXIBLE para alinear los dos botones
    buttonContainer: { 
        display: 'flex',
        justifyContent: 'center',
        gap: '20px', // Espacio entre los botones
        marginTop: 25,
    },
    // 🟢 ESTILO NUEVO PARA EL BOTÓN DE OCULTAR
    toggleBtn: {
        backgroundColor: '#d69766',
        color: 'white',
        padding: '10px 25px',
        border: 'none',
        borderRadius: 10,
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1em',
        transition: '0.2s',
    },
    table: {
        width: "90%",
        maxWidth: "1000px",
        margin: "20px auto",
        borderCollapse: "separate",
        borderSpacing: "0 0",
        backgroundColor: "#ffffffff",
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    headerRow: {
        backgroundColor: '#e7aa71cb',
        color: '#6b4b34',
    },
    th: {
        padding: '12px 15px',
        textAlign: 'left',
        fontWeight: 'bold',
    },
    dataRow: {
        borderBottom: '1px solid #eee',
    },
    td: {
        padding: '10px 15px',
        textAlign: 'left',
        verticalAlign: 'top',
    },
    tdTotal: {
        padding: '10px 15px',
        textAlign: 'right',
        fontWeight: 'bold',
        color: '#96491d',
    },
    productItem: {
        fontSize: '0.9em',
        lineHeight: '1.4',
        borderBottom: '1px dotted #ccc',
        padding: '3px 0',
    },
    productName: {
        fontWeight: '600',
    },
    productDetails: {
        color: '#555',
        marginLeft: 5,
    },
    volverBtn: {
        backgroundColor: "#6b4b34a8",
        color: "white",
        padding: "10px 25px",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: '1em',
    },
};
