import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Ventas.css";

export default function Ventas() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);

  // Cargar productos desde el backend
  useEffect(() => {
    axios
      .get(`${API_URL}/productos`)
      .then((res) => setProductos(res.data))
      .catch((err) => console.error("Error cargando productos:", err));
  }, [API_URL]);

  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    const existe = carrito.find((p) => p.id_producto === producto.id_producto);
    if (existe) {
      setCarrito(
        carrito.map((p) =>
          p.id_producto === producto.id_producto
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
    setTotal(total + producto.precio_venta);
  };

  // Eliminar producto del carrito
  const eliminarDelCarrito = (id_producto) => {
    const item = carrito.find((p) => p.id_producto === id_producto);
    if (item) {
      setCarrito(carrito.filter((p) => p.id_producto !== id_producto));
      setTotal(total - item.precio_venta * item.cantidad);
    }
  };

  // Registrar venta (simulación)
  const registrarVenta = () => {
    if (carrito.length === 0) return alert("No hay productos en la venta.");

    const datosVenta = {
      total,
      items: carrito.map((p) => ({
        id_producto: p.id_producto,
        cantidad: p.cantidad,
      })),
    };

    axios
      .post(`${API_URL}/ventas`, datosVenta)
      .then(() => {
        alert("Venta registrada correctamente ✅");
        setCarrito([]);
        setTotal(0);
      })
      .catch((err) => console.error("Error registrando venta:", err));
  };

  return (
    <div className="ventas-container">
      <h2>Registro de Ventas</h2>

      <div className="ventas-layout">
        {/* 🧃 Productos disponibles */}
        <div className="productos-section">
          <h3>Productos Disponibles</h3>
          <div className="productos-grid">
            {productos.map((prod) => (
              <div key={prod.id_producto} className="producto-card">
                <img
                  src={
                    prod.jerarquia === "Bebidas"
                      ? "https://cdn-icons-png.flaticon.com/512/826/826970.png"
                      : "https://cdn-icons-png.flaticon.com/512/924/924514.png"
                  }
                  alt={prod.nombre_producto}
                />
                <h4>{prod.nombre_producto}</h4>
                <p>${prod.precio_venta}</p>
                <button onClick={() => agregarAlCarrito(prod)}>
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 🛒 Carrito */}
        <div className="carrito-section">
          <h3>Carrito</h3>
          {carrito.length === 0 ? (
            <p>No hay productos seleccionados.</p>
          ) : (
            <table className="carrito-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((item) => (
                  <tr key={item.id_producto}>
                    <td>{item.nombre_producto}</td>
                    <td>{item.cantidad}</td>
                    <td>${item.precio_venta * item.cantidad}</td>
                    <td>
                      <button
                        className="btn-eliminar"
                        onClick={() =>
                          eliminarDelCarrito(item.id_producto)
                        }
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3>Total: ${total}</h3>
          <button className="btn-confirmar" onClick={registrarVenta}>
            Confirmar Venta
          </button>
        </div>
      </div>
    </div>
  );
}
