
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required."
      });
    }

    if (!["admin", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Email is already registered."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), normalizedEmail, hashedPassword, role]
    );

    res.status(201).json({
      message: "Registration successful.",
      user: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
        role
      }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Email is already registered."
      });
    }

    console.error("Registration error:", error.message);
    res.status(500).json({
      message: "Server error during registration."
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password and role are required."
      });
    }

    const [users] = await db.execute(
      "SELECT id, name, email, password, role FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    const user = users[0];

    if (!user || user.role !== role) {
      return res.status(401).json({
        message: "Invalid credentials or role."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid credentials."
      });
    }

    const token = jwt.sign(
      {
        id: String(user.id),
        name: user.name,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      message: "Server error during login."
    });
  }
});

router.get("/me", authenticate, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
