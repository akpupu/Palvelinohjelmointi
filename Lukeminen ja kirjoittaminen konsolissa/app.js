const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Valitse toiminto:");
console.log("1) Lue tiedosto");
console.log("2) Lisää rivi");

rl.question("Valintasi: ", (choice) => {
  if (choice === "1") {
    fs.readFile("loki.txt", "utf8", (err, data) => {
      if (err) {
        console.log("Tiedostoa ei voitu lukea tai se ei ole olemassa.");
      } else {
        console.log("\n--- Tiedoston sisältö ---");
        console.log(data);
      }
      rl.close();
    });
  } else if (choice === "2") {
    rl.question("Kirjoita lisättävä rivi: ", (text) => {
      fs.writeFile("loki.txt", text + "\n", { flag: "a+" }, (err) => {
        if (err) {
          console.log("Virhe kirjoitettaessa tiedostoon.");
        } else {
          console.log("Rivi lisätty tiedostoon.");
        }
        rl.close();
      });
    });
  } else {
    console.log("Virheellinen valinta.");
    rl.close();
  }
});
