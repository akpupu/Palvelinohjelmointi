import mysql from "mysql2/promise";
import dbconfig from "./dbconfig.json" with { type: "json" };

const pool = mysql.createPool(dbconfig);

const getConnection = async () => {
  return await pool.getConnection();
};

// ONLY ADMINS
const findAdminUser = async (identifier) => {
  const connection = await getConnection();
  try {
    const sql = `
      SELECT *
      FROM system_user
      WHERE (id = ? OR email = ?)
      AND admin = 1
      LIMIT 1
    `;
    const [rows] = await connection.execute(sql, [
      Number(identifier) || 0,
      identifier,
    ]);
    return rows[0] || null;
  } finally {
    connection.release();
  }
};

const getFeedback = async () => {
  const c = await getConnection();
  try {
    const [rows] = await c.execute("SELECT * FROM feedback");
    return rows;
  } finally {
    c.release();
  }
};

const getCustomers = async () => {
  const c = await getConnection();
  try {
    const [rows] = await c.execute(`
      SELECT
        c.name AS company_name,
        su.id AS user_id,
        su.fullname,
        su.email,
        su.admin
      FROM system_user su
      LEFT JOIN customer c ON su.customer_id = c.id
    `);
    return rows;
  } finally {
    c.release();
  }
};

const getTickets = async () => {
  const c = await getConnection();
  try {
    const [rows] = await c.execute("SELECT * FROM support_ticket");
    return rows;
  } finally {
    c.release();
  }
};

const getTicketById = async (id) => {
  const c = await getConnection();
  try {
    const [rows] = await c.execute(
      "SELECT * FROM support_ticket WHERE id = ?",
      [id],
    );
    return rows[0];
  } finally {
    c.release();
  }
};

const getTicketMessages = async (ticketId) => {
  const c = await getConnection();
  try {
    const sql = `
      SELECT sm.*, u.fullname AS sender_name, u.admin
      FROM support_message sm
      LEFT JOIN system_user u ON sm.from_user = u.id
      WHERE sm.ticket_id = ?
      ORDER BY sm.created_at ASC
    `;
    const [rows] = await c.execute(sql, [ticketId]);

    return rows.map((row) => ({
      ...row,
      message: row.body,
      is_admin: row.admin === 1,
    }));
  } finally {
    c.release();
  }
};

const addTicketMessage = async (ticketId, senderId, content) => {
  const c = await getConnection();
  try {
    await c.execute(
      `INSERT INTO support_message (ticket_id, from_user, body, created_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [ticketId, senderId, content],
    );
  } finally {
    c.release();
  }
};

const updateTicketStatus = async (ticketId, status) => {
  const c = await getConnection();
  try {
    await c.execute(`UPDATE support_ticket SET status = ? WHERE id = ?`, [
      status,
      ticketId,
    ]);
  } finally {
    c.release();
  }
};

export default {
  findAdminUser,
  getFeedback,
  getCustomers,
  getTickets,
  getTicketById,
  getTicketMessages,
  addTicketMessage,
  updateTicketStatus,
};
