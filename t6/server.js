import express from "express";
import db from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import bcrypt from "bcrypt";
import config from "./config.json" with { type: "json" };

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

// Require login
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

// Require admin (extra protection)
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.admin !== 1) {
    return res.status(403).send("Forbidden");
  }
  next();
};

// VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/inc", express.static(path.join(__dirname, "includes")));

// LOGIN
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await db.findAdminUser(identifier);

    // Only admins allowed
    if (!user || user.admin !== 1 || !user.password) {
      return res.render("login", { error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.render("login", { error: "Invalid credentials" });
    }

    // Store session
    req.session.user = {
      id: user.id,
      email: user.email,
      admin: user.admin,
    };

    res.redirect("/feedback");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Login failed");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// ROUTES
app.get("/", requireLogin, (req, res) => {
  res.redirect("/feedback");
});

app.get("/feedback", requireLogin, async (req, res) => {
  try {
    const rows = await db.getFeedback();
    res.render("feedback", { rows });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading feedback");
  }
});

// admin only
app.get("/customers", requireAdmin, async (req, res) => {
  try {
    const rows = await db.getCustomers();
    res.render("customers", { rows });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading customers");
  }
});

// admin only
app.get("/tickets", requireAdmin, async (req, res) => {
  try {
    const rows = await db.getTickets();
    res.render("tickets", { rows });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading tickets");
  }
});

app.get("/support_ticket", requireAdmin, async (req, res) => {
  try {
    const ticketId = req.query.id;

    if (!ticketId) {
      return res.status(400).send("Ticket ID missing");
    }

    const ticket = await db.getTicketById(ticketId);

    if (!ticket) {
      return res.status(404).send("Ticket not found");
    }

    const messages = await db.getTicketMessages(ticketId);

    res.render("support_ticket", {
      ticket,
      messages: messages || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading ticket");
  }
});

app.post("/add_reply", requireAdmin, async (req, res) => {
  try {
    const { ticket_id, message } = req.body;
    const userId = req.session.user.id;

    if (!message || message.trim() === "") {
      return res.redirect(`/support_ticket?id=${ticket_id}`);
    }

    await db.addTicketMessage(ticket_id, userId, message);

    res.redirect(`/support_ticket?id=${ticket_id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Message failed");
  }
});

app.post("/update-ticket/:id", requireAdmin, async (req, res) => {
  try {
    await db.updateTicketStatus(req.params.id, req.body.status);
    res.redirect(`/support_ticket?id=${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Update failed");
  }
});

app.listen(config.port, config.host, () => {
  console.log(`Server running at http://${config.host}:${config.port}`);
});
