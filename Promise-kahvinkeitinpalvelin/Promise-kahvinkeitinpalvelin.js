const express = require("express");
const app = express();
const PORT = 3000;

let isMachineOn = false;

function makeCoffee() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (isMachineOn) {
        resolve("☕ Coffee is ready!");
      } else {
        reject("🚫 Coffee machine is off.");
      }
    }, 2000);
  });
}

app.get("/", (req, res) => {
  res.send(
    "Kahvinkeitinpalvelin on käynnissä! Käytä reittejä /set/on, /set/off, /switch ja /coffee.",
  );
});

app.get("/set/on", (req, res) => {
  isMachineOn = true;
  res.json({ status: "Machine is ON" });
});

app.get("/set/off", (req, res) => {
  isMachineOn = false;
  res.json({ status: "Machine is OFF" });
});

app.get("/switch", (req, res) => {
  isMachineOn = !isMachineOn;
  res.json({ status: `Machine is ${isMachineOn ? "ON" : "OFF"}` });
});

app.get("/coffee", (req, res) => {
  makeCoffee()
    .then((result) => res.json({ message: result }))
    .catch((error) => res.status(400).json({ error }));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
