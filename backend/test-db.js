
const pool = require("./db");

async function testConnection() {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    console.log("MySQL connected successfully!");
    console.log("Tables found:", rows);
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
