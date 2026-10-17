const request = require("supertest");
const app = require("../src/server");

describe("Servidor estático del frontend", () => {
  test("exporta la app de express", () => {
    expect(typeof app).toBe("function");
  });

  test("GET / responde 200 con HTML", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/html/);
  });

  const paginas = [
    ["login.html", "Ingreso"],
    ["dashboard.html", "Dashboard"],
    ["fumigacion.html", "Registrar Fumigación"],
    ["historial.html", "Historial"],
    ["inventario.html", "Inventario"],
  ];

  test.each(paginas)("GET /%s responde 200 y tiene el título %s", async (pagina, titulo) => {
    const res = await request(app).get(`/${pagina}`);
    expect(res.status).toBe(200);
    expect(res.text).toContain(titulo);
  });

  test("sirve la hoja de estilos", async () => {
    const res = await request(app).get("/css/styles.css");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/css/);
  });

  test.each(["api.js", "login.js", "layout.js", "dashboard.js", "fumigacion.js", "historial.js", "inventario.js"])(
    "sirve el script js/%s",
    async (archivo) => {
      const res = await request(app).get(`/js/${archivo}`);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/javascript/);
    }
  );

  test("una ruta que no existe responde 404", async () => {
    const res = await request(app).get("/no-existe.html");
    expect(res.status).toBe(404);
  });
});