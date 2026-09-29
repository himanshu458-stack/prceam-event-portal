const express = require("express");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/:eventId",
  authenticate,
  requireRole("student"),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.eventId);

      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }

      if (event.registeredCount >= event.maxSeats) {
        return res.status(400).json({ message: "No seats are available." });
      }

      const existing = await Registration.findOne({
        event: event._id,
        student: req.user.id
      });

      if (existing) {
        return res.status(409).json({
          message: "You are already registered for this event."
        });
      }

      // Atomic seat reservation: only increment while seats remain.
      const updatedEvent = await Event.findOneAndUpdate(
        {
          _id: event._id,
          $expr: { $lt: ["$registeredCount", "$maxSeats"] }
        },
        { $inc: { registeredCount: 1 } },
        { new: true }
      );

      if (!updatedEvent) {
        return res.status(400).json({ message: "No seats are available." });
      }

      try {
        await Registration.create({
          event: event._id,
          student: req.user.id
        });
      } catch (registrationError) {
        // If the unique index catches a duplicate created concurrently,
        // return a useful response. The count is corrected for this request.
        if (registrationError.code === 11000) {
          await Event.findByIdAndUpdate(event._id, {
            $inc: { registeredCount: -1 }
          });
          return res.status(409).json({
            message: "You are already registered for this event."
          });
        }

        await Event.findByIdAndUpdate(event._id, {
          $inc: { registeredCount: -1 }
        });
        throw registrationError;
      }

      res.status(201).json({
        message: "Registration successful.",
        remainingSeats: updatedEvent.maxSeats - updatedEvent.registeredCount
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Unable to register for the event." });
    }
  }
);

router.get(
  "/my",
  authenticate,
  requireRole("student"),
  async (req, res) => {
    try {
      const registrations = await Registration.find({
        student: req.user.id
      })
        .populate("event")
        .sort({ createdAt: -1 });

      res.json(registrations);
    } catch {
      res.status(500).json({ message: "Unable to load your registrations." });
    }
  }
);

module.exports = router;
