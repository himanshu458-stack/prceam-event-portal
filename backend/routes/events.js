const express = require("express");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name email")
      .sort({ date: 1, time: 1 });

    res.json(
      events.map((event) => ({
        ...event.toObject(),
        remainingSeats: Math.max(event.maxSeats - event.registeredCount, 0)
      }))
    );
  } catch {
    res.status(500).json({ message: "Unable to load events." });
  }
});

router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, date, time, maxSeats } = req.body;
    const capacity = Number(maxSeats);

    if (!name || !date || !time || !Number.isInteger(capacity) || capacity < 1) {
      return res.status(400).json({
        message: "Event name, date, time and a valid maximum seat count are required."
      });
    }

    const event = await Event.create({
      name: name.trim(),
      date,
      time,
      maxSeats: capacity,
      createdBy: req.user.id
    });

    res.status(201).json({
      ...event.toObject(),
      remainingSeats: event.maxSeats
    });
  } catch {
    res.status(500).json({ message: "Unable to create event." });
  }
});

router.get(
  "/:id/attendees",
  authenticate,
  requireRole("admin"),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }

      const registrations = await Registration.find({ event: event._id })
        .populate("student", "name email")
        .sort({ createdAt: 1 });

      res.json({
        event: {
          id: event._id,
          name: event.name,
          date: event.date,
          time: event.time
        },
        attendees: registrations.map((registration) => ({
          id: registration.student._id,
          name: registration.student.name,
          email: registration.student.email,
          registeredAt: registration.createdAt
        }))
      });
    } catch {
      res.status(500).json({ message: "Unable to load attendees." });
    }
  }
);

module.exports = router;
