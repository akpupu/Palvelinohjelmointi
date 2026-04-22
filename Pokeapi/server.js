const express = require("express");
const app = express();
const port = 3000;

const fetch = global.fetch;

app.set("view engine", "ejs");
app.use(express.static("public"));

/* -------------------- ETUSIVU -------------------- */
app.get("/", (req, res) => {
  return res.render("etusivu");
});

/* -------------------- SUKUPOLVI -------------------- */
app.get("/sukupolvi/:numero", async (req, res) => {
  const nro = Number(req.params.numero);

  // validointi
  if (!nro || nro < 1 || nro > 9) {
    return res.status(404).render("virhe", {
      viesti: "Sukupolvea ei löytynyt!",
    });
  }

  const osoite = `https://pokeapi.co/api/v2/generation/${nro}/`;

  try {
    const vastaus = await fetch(osoite);
    if (!vastaus.ok) throw new Error("API-virhe");

    const data = await vastaus.json();

    const species = data?.pokemon_species ?? [];

    const sortedPokemon = species
      .map((p) => ({
        name: p.name,
        id: Number(p.url.split("/").filter(Boolean).pop()),
      }))
      .sort((a, b) => a.id - b.id);

    return res.render("sukupolvi", {
      sukupolvi: sortedPokemon,
      numero: nro,
    });
  } catch (virhe) {
    console.error("Sukupolvi virhe:", virhe.message);

    return res.status(500).render("virhe", {
      viesti: "Virhe haettaessa sukupolvea!",
    });
  }
});

/* -------------------- POKEMON -------------------- */
app.get("/pokemon/:nimi", async (req, res) => {
  const nimi = req.params.nimi.toLowerCase().trim();

  const osoite = `https://pokeapi.co/api/v2/pokemon/${nimi}`;

  try {
    const vastaus = await fetch(osoite);
    if (!vastaus.ok) throw new Error("Not found");

    const data = await vastaus.json();

    return res.render("pokemon", {
      pokemon: data,
    });
  } catch (virhe) {
    return res.status(404).render("virhe", {
      viesti: "Pokemonia ei löytynyt!",
    });
  }
});

/* -------------------- SEARCH -------------------- */
app.get("/search", (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.redirect("/");
  }

  const nimi = query.toLowerCase().trim();

  return res.redirect(`/pokemon/${nimi}`);
});

/* -------------------- START -------------------- */
app.listen(port, () => {
  console.log(`Palvelin käynnissä: http://localhost:${port}`);
});
