const lista = document.getElementById("catalogo-lista");
const mensajeCatalogo = document.getElementById("mensaje-catalogo");
const buscador = document.getElementById("buscar");
const dialogo = document.getElementById("dialogo-reserva");
const formReserva = document.getElementById("form-reserva");
const mensajeReserva = document.getElementById("mensaje-reserva");
const totalReserva = document.getElementById("total-reserva");
const botonEnviar = document.getElementById("enviar-reserva");

const MAX_POR_RESERVA = 10;
const POCOS_CUPOS = 5; // desde aquí se avisa "últimos cupos"
let eventos = [];
let filtro = "todos";
let seleccionado = null;

// Bloque "cuándo": fecha en grande (día y mes) y, al lado, día de la semana y hora.
function cuando(ev) {
  if (!ev.fecha) {
    return el("div", { class: "cuando" },
      el("div", { class: "fecha-bloque sin-fecha", "aria-hidden": "true" }, el("strong", {}, "-")),
      el("div", { class: "detalle" }, el("span", {}, "Fecha a convenir")));
  }
  const f = partesFecha(ev.fecha);
  return el("div", { class: "cuando" },
    el("div", { class: "fecha-bloque", "aria-hidden": "true" }, el("strong", {}, f.dia), el("span", {}, f.mes)),
    el("time", { class: "detalle", datetime: ev.fecha },
      el("span", {}, f.diaSemana.charAt(0).toUpperCase() + f.diaSemana.slice(1)), el("small", {}, `${f.hora} h`)));
}

function indicadorCupos(cupos) {
  if (cupos === 0) return el("span", { class: "insignia agotado" }, "Agotado");
  if (cupos <= POCOS_CUPOS) {
    return el("span", { class: "insignia aviso" }, cupos === 1 ? "¡Último cupo!" : `¡Últimos ${cupos} cupos!`);
  }
  return el("p", { class: "suave" }, `Cupos disponibles: ${cupos}`);
}

function tarjeta(ev) {
  const agotado = ev.cupos === 0;
  return el("article", { class: "tarjeta tipo-" + ev.tipo },
    el("span", { class: "etiqueta" }, ev.tipo),
    el("h3", {}, ev.nombre),
    el("p", { class: "suave" }, ev.descripcion),
    cuando(ev),
    ev.lugar ? el("p", { class: "suave" }, ev.lugar) : null,
    indicadorCupos(ev.cupos),
    el("div", { class: "precio" }, dinero(ev.precio)),
    el("button", { class: "principal", type: "button", disabled: agotado ? "" : null,
                   onclick: () => abrirReserva(ev) }, agotado ? "Agotado" : "Reservar"),
  );
}

function coincide(ev, consulta) {
  return !consulta || normalizar(`${ev.nombre} ${ev.lugar} ${ev.descripcion}`).includes(consulta);
}

function pintar() {
  const consulta = normalizar(buscador.value.trim());
  const visibles = eventos.filter((e) => (filtro === "todos" || e.tipo === filtro) && coincide(e, consulta));
  if (!visibles.length) {
    const filtrando = consulta || filtro !== "todos";
    lista.replaceChildren(el("p", { class: "vacio suave" },
      filtrando ? "Nada coincide con tu búsqueda. Prueba con otras palabras o quita el filtro." : "No hay nada disponible por ahora."));
    return;
  }
  lista.replaceChildren(...visibles.map(tarjeta));
}

async function cargar() {
  try {
    eventos = await api("/eventos");
    mostrarMensaje(mensajeCatalogo, "");
    pintar();
  } catch (e) {
    lista.replaceChildren();
    mostrarMensaje(mensajeCatalogo, e.message);
  }
}

document.querySelectorAll("[data-filtro]").forEach((boton) =>
  boton.addEventListener("click", () => {
    filtro = boton.dataset.filtro;
    document.querySelectorAll("[data-filtro]").forEach((b) => b.setAttribute("aria-pressed", String(b === boton)));
    pintar();
  }));
buscador.addEventListener("input", pintar);

function actualizarTotal() {
  const cantidad = Number(formReserva.elements.cantidad.value);
  totalReserva.value = seleccionado && cantidad > 0 ? dinero(seleccionado.precio * cantidad) : "";
}

function abrirReserva(ev) {
  seleccionado = ev;
  formReserva.reset();
  mostrarErroresCampos(formReserva, {});
  mostrarMensaje(mensajeReserva, "");
  botonEnviar.disabled = false;
  botonEnviar.textContent = "Confirmar reserva";
  formReserva.elements.evento_id.value = ev.id;
  formReserva.elements.cantidad.max = Math.min(MAX_POR_RESERVA, ev.cupos);
  document.getElementById("titulo-reserva").textContent = `Reservar: ${ev.nombre}`;
  document.getElementById("resumen-reserva").textContent = `${fechaLarga(ev.fecha)} · ${dinero(ev.precio)} por persona`;
  actualizarTotal();
  dialogo.showModal();
}

// Mismas reglas que el servidor (backend/app.py, validar_reserva) para avisar antes de enviar.
// El servidor sigue siendo quien decide: si las reglas cambian allí, cámbialas aquí también.
function validarReserva(datos) {
  const errores = {};
  const maximo = Math.min(MAX_POR_RESERVA, seleccionado ? seleccionado.cupos : MAX_POR_RESERVA);
  const cantidad = /^\d+$/.test(String(datos.cantidad).trim()) ? Number(datos.cantidad) : 0;
  if (cantidad < 1 || cantidad > maximo) {
    errores.cantidad = maximo === 1 ? "Solo queda 1 cupo disponible." : `La cantidad debe estar entre 1 y ${maximo}.`;
  }
  const nombre = String(datos.nombre).trim();
  if (nombre.length < 2 || nombre.length > 100) errores.nombre = "Escribe tu nombre completo (2 a 100 caracteres).";
  if (!/^[A-Za-z0-9-]{5,20}$/.test(String(datos.documento).trim())) {
    errores.documento = "El documento debe tener de 5 a 20 letras, números o guiones.";
  }
  const correo = String(datos.correo).trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo) || correo.length > 120) errores.correo = "Escribe un correo válido.";
  if (!/^\+?\d{7,15}$/.test(String(datos.telefono).replace(/[\s-]/g, ""))) {
    errores.telefono = "El teléfono debe tener de 7 a 15 dígitos.";
  }
  return errores;
}

formReserva.elements.cantidad.addEventListener("input", actualizarTotal);
document.getElementById("cancelar-reserva").addEventListener("click", () => dialogo.close());

formReserva.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mostrarErroresCampos(formReserva, {});
  mostrarMensaje(mensajeReserva, "");
  const datos = Object.fromEntries(new FormData(formReserva));
  const errores = validarReserva(datos);
  if (Object.keys(errores).length) {
    mostrarMensaje(mensajeReserva, "Revisa los datos del formulario.");
    mostrarErroresCampos(formReserva, errores);
    formReserva.querySelector("[aria-invalid]")?.focus();
    return;
  }
  botonEnviar.disabled = true; // evita reservas dobles por doble clic
  botonEnviar.textContent = "Reservando…";
  try {
    const reserva = await api("/reservas", { metodo: "POST", cuerpo: datos });
    sessionStorage.setItem("correo:" + reserva.codigo, reserva.correo);
    location.href = "comprobante.html?codigo=" + encodeURIComponent(reserva.codigo);
  } catch (e) {
    mostrarMensaje(mensajeReserva, e.message);
    mostrarErroresCampos(formReserva, e.campos);
    if (e.estado === 409) cargar(); // los cupos cambiaron: refresca el catálogo
    botonEnviar.disabled = false;
    botonEnviar.textContent = "Confirmar reserva";
  }
});

document.getElementById("form-consulta").addEventListener("submit", (evento) => {
  evento.preventDefault();
  const f = evento.target.elements;
  const codigo = f.codigo.value.trim().toUpperCase();
  sessionStorage.setItem("correo:" + codigo, f.correo.value.trim().toLowerCase());
  location.href = "comprobante.html?codigo=" + encodeURIComponent(codigo);
});

lista.replaceChildren(el("p", { class: "vacio suave" }, "Cargando…"));
cargar();
