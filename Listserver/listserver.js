import express from "express";
import ohjelmointikielet from "./data/ohjelmointikielet.json" with { type: "json" };

const app = express();

const port = 3000;
const host = "localhost";

app.set("view engine", "ejs");

app.set("views", "sivupohjaus");

app.get("/ohjelmointikielet", (req, res) => {
  res.render("listaus", {
    otsikko: "Ohjelmointikielet",
    tiedot: ohjelmointikielet,
  });
});

app.get("/ohjelmointikielet/:id", (req, res) => {
  const haettava = req.params.id;
  const tulos = ohjelmointikielet.filter((kieli) => kieli.id == haettava);
  res.render("tiedot", {
    nimi: tulos[0].nimi,
    kuvaus: tulos[0].kuvaus,
  });
});
// käynnistetään palvelin
app.listen(port, host, () => console.log(`${host}:${port} kuuntelee...`));
