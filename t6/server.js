import express from "express";
import db from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

import config from "./config.json" with { type: "json" };

const app = express();

const __dirname = fileURLToPath(new URL(".", import.meta.url));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/inc", express.static(path.join(__dirname, "includes")));

// 🔹 FEEDBACK
app.get("/feedback", async (req, res) => {
  try {
    const rows = await db.getFeedback();
    res.render("feedback", { rows });
  } catch (error) {
    console.error("Database error: " + error);
    res.status(500).send("Internal server error");
  }
});

// 🔹 CUSTOMERS & USERS
app.get("/customers", async (req, res) => {
  try {
    const rows = await db.getCustomers();
    res.render("customers", { rows });
  } catch (error) {
    console.error("Database error: " + error);
    res.status(500).send("Internal server error");
  }
});

// 🔹 TICKETS
app.get("/tickets", async (req, res) => {
  try {
    const rows = await db.getTickets();
    res.render("tickets", { rows });
  } catch (error) {
    console.error("Database error: " + error);
    res.status(500).send("Internal server error");
  }
});

// 🔹 ROOT → ohjaa esim. feedbackiin
app.get("/", (req, res) => {
  res.redirect("/feedback");
});

// Käytetään config-tiedostosta haettuja arvoja (config.port ja config.host)
app.listen(config.port, config.host, () => {
  console.log(
    `Palvelin käynnissä osoitteessa http://${config.host}:${config.port}`,
  );
});
