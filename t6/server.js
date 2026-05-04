import express from "express";
import db from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import bcrypt from "bcrypt";

const app = express();
const __dirname = fileURLToPath(new URL(".", import.meta.url));

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

const requireLogin = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.admin !== 1) {
    return res.status(403).send("Forbidden");
  }
  next();
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/inc", express.static(path.join(__dirname, "includes")));

// AUTH ROUTES
app.get("/login", (req, res) => res.render("login", { error: null }));

app.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await db.findAdminUser(identifier);
    if (!user || user.admin !== 1)
      return res.render("login", { error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render("login", { error: "Invalid credentials" });

    req.session.user = { id: user.id, email: user.email, admin: user.admin };
    res.redirect("/feedback");
  } catch (error) {
    res.status(500).send("Login failed");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// CONTENT ROUTES
app.get("/", requireLogin, (req, res) => res.redirect("/feedback"));

app.get("/feedback", requireLogin, async (req, res) => {
  const rows = await db.getFeedback();
  res.render("feedback", { rows });
});

app.get("/customers", requireAdmin, async (req, res) => {
  const rows = await db.getCustomers();
  res.render("customers", { rows });
});

app.get("/tickets", requireAdmin, async (req, res) => {
  const rows = await db.getTickets();
  res.render("tickets", { rows });
});

app.get("/support_ticket", requireAdmin, async (req, res) => {
  const ticketId = req.query.id;
  const ticket = await db.getTicketById(ticketId);
  if (!ticket) return res.status(404).send("Ticket not found");
  const messages = await db.getTicketMessages(ticketId);
  res.render("support_ticket", { ticket, messages });
});

app.post("/add_reply", requireAdmin, async (req, res) => {
  const { ticket_id, message } = req.body;
  await db.addTicketMessage(ticket_id, req.session.user.id, message);
  res.redirect(`/support_ticket?id=${ticket_id}`);
});

// TÄMÄ PÄIVITTÄÄ TILAN
app.post("/update-ticket/:id", requireAdmin, async (req, res) => {
  try {
    await db.updateTicketStatus(req.params.id, req.body.status);
    res.redirect(`/support_ticket?id=${req.params.id}`);
  } catch (error) {
    res.status(500).send("Update failed");
  }
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`),
);
