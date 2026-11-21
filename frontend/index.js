const lista = document.getElementById("catalogo-lista");
const mensajeCatalogo = document.getElementById("mensaje-catalogo");
const dialogo = document.getElementById("dialogo-reserva");
const formReserva = document.getElementById("form-reserva");
const mensajeReserva = document.getElementById("mensaje-reserva");
const totalReserva = document.getElementById("total-reserva");
const botonEnviar = document.getElementById("enviar-reserva");

let eventos = [];
let filtro = "todos";
let seleccionado = null;

function tarjeta(ev) {
  const agotado = ev.cupos === 0;
  return el("article", { class: "tarjeta" },
    el("span", { class: "etiqueta" }, ev.tipo),
    el("h3", {}, ev.nombre),
    el("p", { class: "suave" }, ev.descripcion),
    el("p", {}, fechaLarga(ev.fecha)),
    ev.lugar ? el("p", { class: "suave" }, ev.lugar) : null,
    el("p", { class: "suave" }, agotado ? "Sin cupos" : `Cupos disponibles: ${ev.cupos}`),
    el("div", { class: "precio" }, dinero(ev.precio)),
    el("button", { class: "principal", type: "button", disabled: agotado ? "" : null,
                   onclick: () => abrirReserva(ev) }, agotado ? "Agotado" : "Reservar"),
  );
}

function pintar() {
  const visibles = eventos.filter((e) => filtro === "todos" || e.tipo === filtro);
  lista.replaceChildren(...visibles.map(tarjeta));
  if (!visibles.length) lista.replaceChildren(el("p", { class: "suave" }, "No hay nada disponible por ahora."));
}

async function cargar() {
  try {
    eventos = await api("/eventos");
    mostrarMensaje(mensajeCatalogo, "");
    pintar();
  } catch (e) {
    mostrarMensaje(mensajeCatalogo, e.message);
  }
}

document.querySelectorAll("[data-filtro]").forEach((boton) =>
  boton.addEventListener("click", () => {
    filtro = boton.dataset.filtro;
    document.querySelectorAll("[data-filtro]").forEach((b) => b.setAttribute("aria-pressed", String(b === boton)));
    pintar();
  }));

function actualizarTotal() {
  const cantidad = Number(formReserva.elements.cantidad.value);
  totalReserva.value = seleccionado && cantidad > 0 ? dinero(seleccionado.precio * cantidad) : "";
}

function abrirReserva(ev) {
  seleccionado = ev;
  formReserva.reset();
  mostrarErroresCampos(formReserva, {});
  mostrarMensaje(mensajeReserva, "");
  formReserva.elements.evento_id.value = ev.id;
  formReserva.elements.cantidad.max = Math.min(10, ev.cupos);
  document.getElementById("titulo-reserva").textContent = `Reservar: ${ev.nombre}`;
  document.getElementById("resumen-reserva").textContent = `${fechaLarga(ev.fecha)} · ${dinero(ev.precio)} por persona`;
  actualizarTotal();
  dialogo.showModal();
}

formReserva.elements.cantidad.addEventListener("input", actualizarTotal);
document.getElementById("cancelar-reserva").addEventListener("click", () => dialogo.close());

formReserva.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mostrarErroresCampos(formReserva, {});
  mostrarMensaje(mensajeReserva, "");
  const datos = Object.fromEntries(new FormData(formReserva));
  botonEnviar.disabled = true; // evita reservas dobles por doble clic
  try {
    const reserva = await api("/reservas", { metodo: "POST", cuerpo: datos });
    sessionStorage.setItem("correo:" + reserva.codigo, reserva.correo);
    location.href = "comprobante.html?codigo=" + encodeURIComponent(reserva.codigo);
  } catch (e) {
    mostrarMensaje(mensajeReserva, e.message);
    mostrarErroresCampos(formReserva, e.campos);
    if (e.estado === 409) cargar(); // los cupos cambiaron: refresca el catálogo
    botonEnviar.disabled = false;
  }
});

document.getElementById("form-consulta").addEventListener("submit", (evento) => {
  evento.preventDefault();
  const f = evento.target.elements;
  const codigo = f.codigo.value.trim().toUpperCase();
  sessionStorage.setItem("correo:" + codigo, f.correo.value.trim().toLowerCase());
  location.href = "comprobante.html?codigo=" + encodeURIComponent(codigo);
});

cargar();
