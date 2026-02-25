const fs = request("fs");

const teksti = "hello world";

// synkronisesti
fs.writeFileSync("esimerkki.txt", teksti, "utf8", (err) => {
  if (err) {
    console.error("Tiedosto kirjoitettu epäonnistui;", err);
  } else {
    console.log("Tiedosto kirjoitittaminen onnistui:,");
  }
});

// asynkronisesti
