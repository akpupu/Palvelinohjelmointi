const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Express toimii!");
});

app.listen(port, () => {
  console.log(`Palvelin käynnissä osoitteessa http://localhost:${port}`);
});
