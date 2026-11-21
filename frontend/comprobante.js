const estado = document.getElementById("estado");
const contenedor = document.getElementById("comprobante");
const codigo = (new URLSearchParams(location.search).get("codigo") || "").trim().toUpperCase();

function fila(titulo, valor) {
  return [el("dt", {}, titulo), el("dd", {}, valor)];
}

function pintarComprobante(r) {
  document.title = "Comprobante " + r.codigo;
  contenedor.replaceChildren(el("section", { class: "comprobante", "aria-label": "Comprobante de reserva" },
    el("span", { class: "sello" }, "Reserva confirmada"),
    el("p", { class: "suave", style: "margin-bottom:0" }, "Código de reserva"),
    el("div", { class: "codigo" }, r.codigo),
    el("h2", {}, "Datos del titular"),
    el("dl", {},
      fila("Nombre", r.nombre), fila("Documento", r.documento),
      fila("Correo", r.correo), fila("Teléfono", r.telefono)),
    el("h2", {}, r.evento_tipo === "servicio" ? "Servicio reservado" : "Evento reservado"),
    el("dl", {},
      fila("Nombre", r.evento_nombre), fila("Fecha", fechaLarga(r.evento_fecha)),
      fila("Lugar", r.evento_lugar || "-"), fila("Cantidad", r.cantidad),
      fila("Valor unitario", dinero(r.precio_unitario)),
      [el("dt", {}, "Total"), el("dd", { class: "total" }, dinero(r.total))]),
    el("p", { class: "suave" }, "Emitido el " + new Date(r.creada).toLocaleString("es", { dateStyle: "long", timeStyle: "short" })
      + ". Presenta este comprobante (impreso o en tu celular) junto con tu documento."),
    el("div", { class: "acciones no-imprimir" },
      el("button", { class: "principal", type: "button", onclick: () => window.print() }, "Imprimir o guardar como PDF")),
  ));
}

async function cargar(correo) {
  try {
    const r = await api("/reservas/consultar", { metodo: "POST", cuerpo: { codigo, correo } });
    sessionStorage.setItem("correo:" + codigo, correo);
    mostrarMensaje(estado, "");
    pintarComprobante(r);
  } catch (e) {
    contenedor.replaceChildren();
    mostrarMensaje(estado, e.message);
    pedirCorreo();
  }
}

// Si no tenemos el correo (por ejemplo, otro dispositivo), lo pedimos: el código solo no basta.
function pedirCorreo() {
  contenedor.replaceChildren(el("form", { class: "vertical tarjeta", style: "max-width:420px", onsubmit: (ev) => {
    ev.preventDefault();
    cargar(ev.target.elements.correo.value.trim().toLowerCase());
  } },
    el("label", {}, "Correo con el que reservaste", el("input", { name: "correo", type: "email", required: "", autocomplete: "email" })),
    el("div", { class: "acciones" }, el("button", { class: "principal", type: "submit" }, "Ver comprobante"))));
}

if (!codigo) {
  mostrarMensaje(estado, "Falta el código de reserva. Vuelve al inicio y consúltalo desde 'Mi comprobante'.");
} else {
  const guardado = sessionStorage.getItem("correo:" + codigo);
  guardado ? cargar(guardado) : pedirCorreo();
}
