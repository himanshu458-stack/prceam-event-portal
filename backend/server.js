
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const registrationRoutes = require("./routes/registrations");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "College Event Portal API is running."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await db.getConnection();

    console.log("MySQL connected successfully!");

    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
