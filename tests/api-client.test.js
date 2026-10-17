const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Carga public/js/api.js (script de navegador) con window, localStorage y fetch simulados.
function cargarApi({ token = "token-123", fetchMock } = {}) {
  const codigo = fs
    .readFileSync(path.join(__dirname, "..", "public", "js", "api.js"), "utf8")
    .replace(/^\uFEFF/, "");

  const sandbox = {
    window: { API_BASE_URL: "http://backend.test/api" },
    localStorage: { getItem: jest.fn(() => token) },
    fetch: fetchMock,
  };

  vm.runInNewContext(codigo, sandbox);
  return sandbox;
}

const respuesta = (ok, data) => ({ ok, json: () => Promise.resolve(data) });

describe("Cliente API (public/js/api.js)", () => {
  describe("authHeaders", () => {
    test("incluye el token del localStorage como Bearer", () => {
      const api = cargarApi({ token: "abc" });
      expect(api.authHeaders()).toEqual({
        "Content-Type": "application/json",
        Authorization: "Bearer abc",
      });
    });
  });

  describe("login", () => {
    test("envía POST con usuario y contraseña y devuelve token y rol", async () => {
      const fetchMock = jest.fn().mockResolvedValue(respuesta(true, { token: "t", role: "ADMIN" }));
      const api = cargarApi({ fetchMock });

      const data = await api.login("admin", "demo123");

      expect(data).toEqual({ token: "t", role: "ADMIN" });
      expect(fetchMock).toHaveBeenCalledWith(
        "http://backend.test/api/auth/login",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ username: "admin", password: "demo123" }),
        })
      );
    });

    test("lanza error con credenciales inválidas", async () => {
      const fetchMock = jest.fn().mockResolvedValue(respuesta(false, {}));
      const api = cargarApi({ fetchMock });

      await expect(api.login("admin", "mala")).rejects.toThrow("Credenciales inválidas");
    });
  });

  describe("registrarFumigacion", () => {
    test("envía el payload con el token y devuelve la respuesta", async () => {
      const fetchMock = jest.fn().mockResolvedValue(respuesta(true, { id: 1 }));
      const api = cargarApi({ token: "tk", fetchMock });
      const payload = { productoId: "p1", litros: 5 };

      const data = await api.registrarFumigacion(payload);

      expect(data).toEqual({ id: 1 });
      const [url, opciones] = fetchMock.mock.calls[0];
      expect(url).toBe("http://backend.test/api/fumigaciones");
      expect(opciones.method).toBe("POST");
      expect(opciones.headers.Authorization).toBe("Bearer tk");
      expect(opciones.body).toBe(JSON.stringify(payload));
    });

    test("lanza el mensaje de error que devuelve el backend", async () => {
      const fetchMock = jest.fn().mockResolvedValue(respuesta(false, { error: "Stock insuficiente" }));
      const api = cargarApi({ fetchMock });

      await expect(api.registrarFumigacion({})).rejects.toThrow("Stock insuficiente");
    });
  });

  describe("obtenerFumigaciones", () => {
    test("devuelve el historial", async () => {
      const lista = [{ id: 1 }, { id: 2 }];
      const fetchMock = jest.fn().mockResolvedValue(respuesta(true, lista));
      const api = cargarApi({ fetchMock });

      await expect(api.obtenerFumigaciones()).resolves.toEqual(lista);
      expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/fumigaciones");
    });

    test("lanza error si el backend falla", async () => {
      const fetchMock = jest.fn().mockResolvedValue(respuesta(false, {}));
      const api = cargarApi({ fetchMock });

      await expect(api.obtenerFumigaciones()).rejects.toThrow("No se pudo cargar el historial");
    });
  });

  describe("obtenerInventario", () => {
    test("devuelve el inventario", async () => {
      const inventario = [{ nombre: "Fungicida X", stockLitros: 20 }];
      const fetchMock = jest.fn().mockResolvedValue(respuesta(true, inventario));
      const api = cargarApi({ fetchMock });

      await expect(api.obtenerInventario()).resolves.toEqual(inventario);
      expect(fetchMock.mock.calls[0][0]).toBe("http://backend.test/api/fumigaciones/inventario");
    });

    test("lanza error si el backend falla", async () => {
      const fetchMock = jest.fn().mockResolvedValue(respuesta(false, {}));
      const api = cargarApi({ fetchMock });

      await expect(api.obtenerInventario()).rejects.toThrow("No se pudo cargar el inventario");
    });
  });
});