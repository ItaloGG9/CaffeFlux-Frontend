import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Ventas() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);

  // Cargar productos disponibles desde el backend
  useEffect(() => {
    axios.get(`${API_URL}/productos`)
      .then(res => setProductos(res.data))
      .catch(err => console.error("Error cargando productos:", err));
  }, [API_URL]);

  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(p => p.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(p => 
        p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
    setTotal(total + producto.precio_venta);
  };

  // Eliminar producto del carrito
  const eliminarDelCarrito = (id) => {
    const item = carrito.find(p => p.id === id);
    if (item) {
      setCarrito(carrito.filter(p => p.id !== id));
      setTotal(total - (item.precio_venta * item.cantidad));
    }
  };

  // Simular pago / guardar venta
  const registrarVenta = () => {
    if (carrito.length === 0) return alert("No hay productos en la venta.");
    const datosVenta = {
      total,
      items: carrito.map(p => ({ id_producto: p.id, cantidad: p.cantidad }))
    };

    axios.post(`${API_URL}/ventas`, datosVenta)
      .then(() => {
        alert("Venta registrada correctamente ✅");
        setCarrito([]);
        setTotal(0);
      })
      .catch(err => console.error("Error registrando venta:", err));
  };

  return (
    <div style={styles.container}>
      <h2>Registro de Ventas</h2>

      <div style={styles.layout}>
        {/* Lista de productos */}
        <div style={styles.productos}>
          <h3>Productos Disponibles</h3>
          <div style={styles.grid}>
            {productos.map(prod => (
              <button
                key={prod.id}
                style={styles.btnProd}
                onClick={() => agregarAlCarrito(prod)}
              >
                {prod.nombre}<br />${prod.precio_venta}
              </button>
            ))}
          </div>
        </div>

        {/* Carrito */}
        <div style={styles.carrito}>
          <h3>Carrito</h3>
          {carrito.length === 0 ? (
            <p>No hay productos seleccionados.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {carrito.map(item => (
                  <tr key={item.id}>
                    <td>{item.nombre}</td>
                    <td>{item.cantidad}</td>
                    <td>${item.precio_venta * item.cantidad}</td>
                    <td>
                      <button style={styles.btnEliminar}
                        onClick={() => eliminarDelCarrito(item.id)}>
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3>Total: ${total}</h3>
          <button style={styles.btnConfirmar} onClick={registrarVenta}>Confirmar Venta</button>
        </div>
      </div>
    </div>
  );
}

// 🎨 Estilos simples
const styles = {
  container: { padding: 20, textAlign: "center" },
  layout: { display: "flex", justifyContent: "space-between", marginTop: 20 },
  productos: { width: "60%" },
  carrito: { width: "35%", border: "1px solid #ccc", borderRadius: 8, padding: 15 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 },
  btnProd: {
    backgroundColor: "#3a6ea5",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px",
    fontSize: "14px",
    cursor: "pointer"
  },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 10 },
  btnEliminar: { backgroundColor: "transparent", border: "none", cursor: "pointer", fontSize: "16px" },
  btnConfirmar: {
    backgroundColor: "#4caf50",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold"
  }
};
