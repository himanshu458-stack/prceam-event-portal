
const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// Register a student for an event
router.post(
  "/:eventId",
  authenticate,
  requireRole("student"),
  async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
      const eventId = Number(req.params.eventId);
      const studentId = Number(req.user.id);

      if (
        !Number.isSafeInteger(eventId) ||
        eventId < 1 ||
        !Number.isSafeInteger(studentId) ||
        studentId < 1
      ) {
        return res.status(400).json({ message: "Invalid event or student ID." });
      }

      connection = await db.getConnection();

      await connection.beginTransaction();
      transactionStarted = true;

      // Lock the event row while checking and reserving a seat.
      const [events] = await connection.execute(
        `SELECT id, name, max_seats, registered_count
         FROM events
         WHERE id = ?
         FOR UPDATE`,
        [eventId]
      );

      if (events.length === 0) {
        await connection.rollback();
        transactionStarted = false;
        return res.status(404).json({ message: "Event not found." });
      }

      const event = events[0];

      const [existing] = await connection.execute(
        `SELECT id
         FROM registrations
         WHERE event_id = ? AND student_id = ?`,
        [eventId, studentId]
      );

      if (existing.length > 0) {
        await connection.rollback();
        transactionStarted = false;

        return res.status(409).json({
          message: "You are already registered for this event."
        });
      }

      if (event.registered_count >= event.max_seats) {
        await connection.rollback();
        transactionStarted = false;

        return res.status(400).json({
          message: "No seats are available."
        });
      }

      await connection.execute(
        `INSERT INTO registrations (event_id, student_id)
         VALUES (?, ?)`,
        [eventId, studentId]
      );

      await connection.execute(
        `UPDATE events
         SET registered_count = registered_count + 1
         WHERE id = ?`,
        [eventId]
      );

      await connection.commit();
      transactionStarted = false;

      res.status(201).json({
        message: "Registration successful.",
        remainingSeats: Math.max(
          event.max_seats - event.registered_count - 1,
          0
        )
      });
    } catch (error) {
      if (connection && transactionStarted) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error("Rollback error:", rollbackError.message);
        }
      }

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "You are already registered for this event."
        });
      }

      console.error("Registration error:", error.message);

      res.status(500).json({
        message: "Unable to register for the event."
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// Get the logged-in student's registrations
router.get(
  "/my",
  authenticate,
  requireRole("student"),
  async (req, res) => {
    try {
      const studentId = Number(req.user.id);

      const [registrations] = await db.execute(
        `SELECT
          r.id AS registrationId,
          r.registered_at AS registeredAt,
          e.id AS eventId,
          e.name AS eventName,
          e.event_date AS eventDate,
          e.event_time AS eventTime,
          e.max_seats AS maxSeats,
          e.registered_count AS registeredCount
         FROM registrations r
         JOIN events e ON r.event_id = e.id
         WHERE r.student_id = ?
         ORDER BY r.registered_at DESC`,
        [studentId]
      );

      res.json(
        registrations.map((registration) => ({
          id: registration.registrationId,
          registeredAt: registration.registeredAt,
          event: {
            id: registration.eventId,
            _id: String(registration.eventId),
            name: registration.eventName,
            date: registration.eventDate,
            time: registration.eventTime,
            maxSeats: registration.maxSeats,
            registeredCount: registration.registeredCount,
            remainingSeats: Math.max(
              registration.maxSeats - registration.registeredCount,
              0
            )
          }
        }))
      );
    } catch (error) {
      console.error("Load registrations error:", error.message);

      res.status(500).json({
        message: "Unable to load your registrations."
      });
    }
  }
);

module.exports = router;
