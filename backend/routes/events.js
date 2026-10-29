
const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// Get all events
router.get("/", async (req, res) => {
  try {
    const [events] = await db.execute(`
      SELECT
        e.id,
        e.name,
        e.event_date AS date,
        e.event_time AS time,
        e.max_seats AS maxSeats,
        e.registered_count AS registeredCount,
        e.created_at AS createdAt,
        u.name AS creatorName,
        u.email AS creatorEmail
      FROM events e
      JOIN users u ON e.created_by = u.id
      ORDER BY e.event_date ASC, e.event_time ASC
    `);

    res.json(
      events.map((event) => ({
        _id: String(event.id),
        id: event.id,
        name: event.name,
        date: event.date,
        time: event.time,
        maxSeats: event.maxSeats,
        registeredCount: event.registeredCount,
        createdAt: event.createdAt,
        createdBy: {
          name: event.creatorName,
          email: event.creatorEmail
        },
        remainingSeats: Math.max(
          event.maxSeats - event.registeredCount,
          0
        )
      }))
    );
  } catch (error) {
    console.error("Load events error:", error.message);
    res.status(500).json({ message: "Unable to load events." });
  }
});

// Create an event (admin only)
router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, date, time, maxSeats } = req.body;
    const capacity = Number(maxSeats);

    if (
      !name ||
      !date ||
      !time ||
      !Number.isInteger(capacity) ||
      capacity < 1
    ) {
      return res.status(400).json({
        message:
          "Event name, date, time and a valid maximum seat count are required."
      });
    }

    const [result] = await db.execute(
      `INSERT INTO events
        (name, event_date, event_time, max_seats, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), date, time, capacity, Number(req.user.id)]
    );

    const [rows] = await db.execute(
      `SELECT
        e.id,
        e.name,
        e.event_date AS date,
        e.event_time AS time,
        e.max_seats AS maxSeats,
        e.registered_count AS registeredCount,
        e.created_at AS createdAt,
        u.name AS creatorName,
        u.email AS creatorEmail
       FROM events e
       JOIN users u ON e.created_by = u.id
       WHERE e.id = ?`,
      [result.insertId]
    );

    const event = rows[0];

    res.status(201).json({
      _id: String(event.id),
      id: event.id,
      name: event.name,
      date: event.date,
      time: event.time,
      maxSeats: event.maxSeats,
      registeredCount: event.registeredCount,
      createdAt: event.createdAt,
      createdBy: {
        name: event.creatorName,
        email: event.creatorEmail
      },
      remainingSeats: event.maxSeats
    });
  } catch (error) {
    console.error("Create event error:", error.message);
    res.status(500).json({ message: "Unable to create event." });
  }
});

// Get attendees for an event (admin only)
router.get(
  "/:id/attendees",
  authenticate,
  requireRole("admin"),
  async (req, res) => {
    try {
      const eventId = Number(req.params.id);

      if (!Number.isSafeInteger(eventId) || eventId < 1) {
        return res.status(400).json({ message: "Invalid event ID." });
      }

      const [events] = await db.execute(
        `SELECT
          id,
          name,
          event_date AS date,
          event_time AS time
         FROM events
         WHERE id = ?`,
        [eventId]
      );

      if (events.length === 0) {
        return res.status(404).json({ message: "Event not found." });
      }

      const [registrations] = await db.execute(
        `SELECT
          u.id AS studentId,
          u.name AS studentName,
          u.email AS studentEmail,
          r.registered_at AS registeredAt
         FROM registrations r
         JOIN users u ON r.student_id = u.id
         WHERE r.event_id = ?
         ORDER BY r.registered_at ASC`,
        [eventId]
      );

      const event = events[0];

      res.json({
        event: {
          id: String(event.id),
          _id: String(event.id),
          name: event.name,
          date: event.date,
          time: event.time
        },
        attendees: registrations.map((registration) => ({
          id: registration.studentId,
          name: registration.studentName,
          email: registration.studentEmail,
          registeredAt: registration.registeredAt
        }))
      });
    } catch (error) {
      console.error("Load attendees error:", error.message);
      res.status(500).json({ message: "Unable to load attendees." });
    }
  }
);

module.exports = router;
