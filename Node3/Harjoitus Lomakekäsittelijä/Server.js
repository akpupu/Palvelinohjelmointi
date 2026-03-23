const express = require("express");
const path = require("path");

const app = express();
const host = "localhost";
const port = 3000;

// Use EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "LomakeTemplates"));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Etusivu
app.get("/", (req, res) => {
  res.render("index");
});

// Lomake (GET)
app.get("/palaute", (req, res) => {
  res.render("palaute");
});

// Lomakkeen käsittely (POST)
app.post("/palaute", (req, res) => {
  const { nimi, sahkoposti } = req.body;

  res.send(
    `Kiitos palautteestasi, ${nimi}! Otamme sinuun tarvittaessa yhteyttä sähköpostitse osoitteeseen ${sahkoposti}.`,
  );
});

app.listen(port, host, () => {
  console.log(`${host}:${port} kuuntelee...`);
});
