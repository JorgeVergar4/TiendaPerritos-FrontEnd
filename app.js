/**
 * Frontend simple para CRUD de productos de la tienda de perritos.
 */

// Determinar la URL base de la API según el host
// frontend/app.js

const API_BASE = "/api/productos";

// Ejemplo: const API_BASE = "http://10.0.2.30:3001/api/productos";


let editandoId = null;

const tbody = document.getElementById("tbodyProductos");
const btnCargar = document.getElementById("btnCargar");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const formTitle = document.getElementById("formTitle");
const statusDiv = document.getElementById("status");

const inputNombre = document.getElementById("nombre");
const inputDescripcion = document.getElementById("descripcion");
const inputPrecio = document.getElementById("precio");
const inputStock = document.getElementById("stock");

function setStatus(mensaje, tipo = "ok") {
  statusDiv.textContent = mensaje;
  statusDiv.className = "status " + tipo;
}

async function cargarProductos() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Error al cargar productos");
    const data = await res.json();
    renderProductos(data);
    setStatus("Productos cargados correctamente.", "ok");
  } catch (err) {
    console.error(err);
    setStatus("No se pudieron cargar los productos. ¿Está el backend levantado?", "error");
  }
}

function renderProductos(productos) {
  tbody.innerHTML = "";
  productos.forEach((p) => {
    const tr = document.createElement("tr");

    // Stock level badge logic
    let stockBadge = "";
    if (p.stock <= 0) {
      stockBadge = '<span class="badge badge-out-of-stock">Agotado</span>';
    } else if (p.stock < 10) {
      stockBadge = `<span class="badge badge-low-stock">${p.stock} (Bajo)</span>`;
    } else {
      stockBadge = `<span class="badge badge-in-stock">${p.stock}</span>`;
    }

    tr.innerHTML = `
      <td>${p.id}</td>
      <td style="font-weight: 500; color: #1e293b;">${p.nombre}</td>
      <td>${p.descripcion || '<em style="color: #94a3b8; font-size: 0.85rem;">Sin descripción</em>'}</td>
      <td><span class="product-price">$${Number(p.precio).toFixed(2)}</span></td>
      <td>${stockBadge}</td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button data-id="${p.id}" class="btn-action btn-editar" title="Editar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Editar
          </button>
          <button data-id="${p.id}" class="btn-action btn-eliminar" title="Eliminar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            Eliminar
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Asignar eventos a los botones
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      editarProducto(id);
    });
  });

  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (confirm("¿Seguro que deseas eliminar este producto?")) {
        eliminarProducto(id);
      }
    });
  });
}

function limpiarFormulario() {
  editandoId = null;
  formTitle.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);"><path d="M12 5v14M5 12h14"/></svg>
    Nuevo Producto
  `;
  inputNombre.value = "";
  inputDescripcion.value = "";
  inputPrecio.value = "";
  inputStock.value = "";
}

function obtenerDatosFormulario() {
  return {
    nombre: inputNombre.value.trim(),
    descripcion: inputDescripcion.value.trim(),
    precio: parseFloat(inputPrecio.value),
    stock: parseInt(inputStock.value, 10),
  };
}

function validarProducto(prod) {
  if (!prod.nombre) return "El nombre es obligatorio.";
  if (isNaN(prod.precio) || prod.precio < 0) return "El precio debe ser un número mayor o igual a 0.";
  if (isNaN(prod.stock) || prod.stock < 0) return "El stock debe ser un número mayor o igual a 0.";
  return null;
}

async function guardarProducto() {
  const producto = obtenerDatosFormulario();
  const error = validarProducto(producto);
  if (error) {
    setStatus(error, "error");
    return;
  }

  try {
    let res;
    if (editandoId) {
      // Actualizar
      res = await fetch(`${API_BASE}/${editandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });
    } else {
      // Crear
      res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Error al guardar el producto");
    }

    limpiarFormulario();
    await cargarProductos();
    setStatus(editandoId ? "Producto actualizado correctamente." : "Producto creado correctamente.", "ok");
  } catch (err) {
    console.error(err);
    setStatus("Ocurrió un error al guardar el producto.", "error");
  }
}

async function editarProducto(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error("No se pudo obtener el producto");
    const p = await res.json();
    editandoId = p.id;
    formTitle.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      Editar Producto #${p.id}
    `;
    inputNombre.value = p.nombre;
    inputDescripcion.value = p.descripcion || "";
    inputPrecio.value = p.precio;
    inputStock.value = p.stock;
    setStatus("Editando producto.", "ok");
  } catch (err) {
    console.error(err);
    setStatus("No se pudo cargar el producto para editarlo.", "error");
  }
}

async function eliminarProducto(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar producto");
    await cargarProductos();
    setStatus("Producto eliminado correctamente.", "ok");
  } catch (err) {
    console.error(err);
    setStatus("No se pudo eliminar el producto.", "error");
  }
}

// Eventos
btnCargar.addEventListener("click", cargarProductos);
btnGuardar.addEventListener("click", guardarProducto);
btnCancelar.addEventListener("click", () => {
  limpiarFormulario();
  setStatus("Edición cancelada.", "ok");
});

// Cargar productos al iniciar
cargarProductos();
