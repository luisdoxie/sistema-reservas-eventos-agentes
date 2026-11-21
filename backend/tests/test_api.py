import sys
import tempfile
import unittest
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app import create_app

TOKEN = "token-de-prueba"
ADMIN = {"X-Admin-Token": TOKEN}


def futuro(dias=10):
    return (datetime.now() + timedelta(days=dias)).isoformat(timespec="minutes")


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.app = create_app(db_path=Path(self.tmp.name) / "t.db", admin_token=TOKEN, semilla_demo=False)
        self.c = self.app.test_client()

    def evento(self, **extra):
        datos = {"nombre": "Concierto", "tipo": "evento", "fecha": futuro(), "lugar": "Teatro",
                 "precio": 1000, "cupos": 5, "descripcion": "x", **extra}
        r = self.c.post("/api/admin/eventos", json=datos, headers=ADMIN)
        self.assertEqual(r.status_code, 201, r.get_json())
        return r.get_json()

    def reservar(self, evento_id, **extra):
        datos = {"evento_id": evento_id, "cantidad": 2, "nombre": "Ana Pérez", "documento": "12345678",
                 "correo": "Ana@Correo.com", "telefono": "300 123 4567", **extra}
        return self.c.post("/api/reservas", json=datos)

    def consultar(self, codigo, correo):
        return self.c.post("/api/reservas/consultar", json={"codigo": codigo, "correo": correo})


class TestReservas(Base):
    def test_reserva_genera_comprobante_con_sus_datos(self):
        ev = self.evento()
        r = self.reservar(ev["id"])
        self.assertEqual(r.status_code, 201)
        d = r.get_json()
        self.assertRegex(d["codigo"], r"^RES-[A-Z2-9]{8}$")
        self.assertEqual((d["nombre"], d["correo"], d["telefono"]), ("Ana Pérez", "ana@correo.com", "3001234567"))
        self.assertEqual((d["cantidad"], d["precio_unitario"], d["total"]), (2, 1000, 2000))
        self.assertEqual((d["evento_nombre"], d["evento_lugar"]), ("Concierto", "Teatro"))

    def test_descuenta_cupos(self):
        ev = self.evento(cupos=5)
        self.reservar(ev["id"], cantidad=2)
        self.assertEqual(self.c.get(f"/api/eventos/{ev['id']}").get_json()["cupos"], 3)

    def test_sin_cupos_suficientes_no_reserva_ni_descuenta(self):
        ev = self.evento(cupos=1)
        r = self.reservar(ev["id"], cantidad=2)
        self.assertEqual(r.status_code, 409)
        self.assertEqual(self.c.get(f"/api/eventos/{ev['id']}").get_json()["cupos"], 1)
        self.assertEqual(self.c.get("/api/admin/reservas", headers=ADMIN).get_json(), [])

    def test_ultimo_cupo_se_puede_tomar_una_sola_vez(self):
        ev = self.evento(cupos=1)
        self.assertEqual(self.reservar(ev["id"], cantidad=1).status_code, 201)
        self.assertEqual(self.reservar(ev["id"], cantidad=1).status_code, 409)

    def test_evento_pasado_no_se_reserva(self):
        ev = self.evento(fecha=futuro(-3))
        self.assertEqual(self.reservar(ev["id"]).status_code, 409)

    def test_evento_oculto_no_se_reserva(self):
        ev = self.evento()
        self.c.put(f"/api/admin/eventos/{ev['id']}", json={"activo": False}, headers=ADMIN)
        self.assertEqual(self.reservar(ev["id"]).status_code, 404)
        self.assertEqual(self.c.get("/api/eventos").get_json(), [])

    def test_validaciones_devuelven_errores_por_campo(self):
        ev = self.evento()
        r = self.reservar(ev["id"], cantidad=11, nombre="A", documento="1", correo="no-es-correo", telefono="abc")
        self.assertEqual(r.status_code, 400)
        self.assertEqual(set(r.get_json()["campos"]), {"cantidad", "nombre", "documento", "correo", "telefono"})

    def test_cantidad_no_numerica_o_booleana_se_rechaza(self):
        ev = self.evento()
        for malo in ("x", True, 0, -1, 1.5):
            self.assertEqual(self.reservar(ev["id"], cantidad=malo).status_code, 400, malo)

    def test_cuerpo_que_no_es_objeto_json(self):
        self.assertEqual(self.c.post("/api/reservas", json=[1, 2]).status_code, 400)
        self.assertEqual(self.c.post("/api/reservas", data="basura").status_code, 400)

    def test_el_comprobante_conserva_los_datos_aunque_el_evento_cambie(self):
        ev = self.evento(precio=1000)
        codigo = self.reservar(ev["id"]).get_json()["codigo"]
        self.c.put(f"/api/admin/eventos/{ev['id']}", json={"precio": 9999, "nombre": "Otro nombre"}, headers=ADMIN)
        d = self.consultar(codigo, "ana@correo.com").get_json()
        self.assertEqual((d["precio_unitario"], d["evento_nombre"]), (1000, "Concierto"))


class TestConsulta(Base):
    def setUp(self):
        super().setUp()
        self.codigo = self.reservar(self.evento()["id"]).get_json()["codigo"]

    def test_con_codigo_y_correo_correctos(self):
        r = self.consultar(self.codigo.lower(), " ANA@correo.com ")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.get_json()["codigo"], self.codigo)

    def test_correo_incorrecto_o_ausente_da_404_igual_que_un_codigo_inexistente(self):
        a = self.consultar(self.codigo, "otro@correo.com")
        b = self.consultar(self.codigo, "")
        c = self.consultar("RES-NOEXISTE", "ana@correo.com")
        self.assertEqual((a.status_code, b.status_code, c.status_code), (404, 404, 404))
        self.assertEqual(a.get_json(), c.get_json())

    def test_el_correo_no_se_acepta_en_la_url(self):
        r = self.c.get(f"/api/reservas/{self.codigo}", query_string={"correo": "ana@correo.com"})
        self.assertEqual(r.status_code, 404)

    def test_cuerpo_invalido_o_con_tipos_raros(self):
        self.assertEqual(self.c.post("/api/reservas/consultar", json=[1]).status_code, 400)
        self.assertEqual(self.consultar(123, ["x"]).status_code, 404)


class TestAdmin(Base):
    def test_requiere_token(self):
        for token in (None, "", "malo"):
            h = {"X-Admin-Token": token} if token is not None else {}
            self.assertEqual(self.c.get("/api/admin/eventos", headers=h).status_code, 401)
            self.assertEqual(self.c.post("/api/admin/eventos", json={}, headers=h).status_code, 401)
        self.assertEqual(self.c.get("/api/admin/reservas").status_code, 401)

    def test_validacion_de_evento(self):
        r = self.c.post("/api/admin/eventos", json={"nombre": "ab", "tipo": "otro", "precio": -1, "cupos": "x"}, headers=ADMIN)
        self.assertEqual(r.status_code, 400)
        self.assertTrue({"nombre", "tipo", "precio", "cupos"} <= set(r.get_json()["campos"]))

    def test_evento_exige_fecha_pero_servicio_no(self):
        base = {"nombre": "Algo", "precio": 0, "cupos": 1}
        self.assertEqual(self.c.post("/api/admin/eventos", json={**base, "tipo": "evento"}, headers=ADMIN).status_code, 400)
        self.assertEqual(self.c.post("/api/admin/eventos", json={**base, "tipo": "servicio"}, headers=ADMIN).status_code, 201)

    def test_editar_cupos_y_lista_de_reservas(self):
        ev = self.evento(cupos=1)
        r = self.c.put(f"/api/admin/eventos/{ev['id']}", json={"cupos": 8}, headers=ADMIN)
        self.assertEqual(r.get_json()["cupos"], 8)
        self.reservar(ev["id"], cantidad=1)
        lista = self.c.get("/api/admin/reservas", headers=ADMIN).get_json()
        self.assertEqual(len(lista), 1)
        self.assertEqual(self.c.put("/api/admin/eventos/999", json={}, headers=ADMIN).status_code, 404)

    def test_texto_con_html_se_guarda_tal_cual(self):
        # El backend no interpreta HTML; el frontend lo pinta con textContent.
        ev = self.evento(nombre="<img src=x onerror=alert(1)>")
        self.assertEqual(self.c.get(f"/api/eventos/{ev['id']}").get_json()["nombre"], "<img src=x onerror=alert(1)>")


class TestFrontend(Base):
    def test_sirve_las_paginas(self):
        for ruta in ("/", "/comprobante.html", "/admin.html", "/api.js", "/estilos.css"):
            r = self.c.get(ruta)
            self.assertEqual(r.status_code, 200, ruta)
            r.close()
        self.assertEqual(self.c.get("/api/no-existe").status_code, 404)


if __name__ == "__main__":
    unittest.main()
