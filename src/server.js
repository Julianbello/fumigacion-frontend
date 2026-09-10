const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "..", "public")));

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Frontend fumigación escuchando en puerto ${PORT}`));
}

module.exports = app;