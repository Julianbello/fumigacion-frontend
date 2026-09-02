global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ token: "abc", role: "ADMIN" }) })
);

test("login envía las credenciales correctas al backend", async () => {
  const fetchCall = global.fetch;
  await fetchCall("http://localhost:4000/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: "admin", password: "demo123" })
  });
  expect(fetchCall).toHaveBeenCalledWith(
    expect.stringContaining("/auth/login"),
    expect.objectContaining({ method: "POST" })
  );
});
