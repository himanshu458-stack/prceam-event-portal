import React from "react";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [attendees, setAttendees] = useState(null);
  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    maxSeats: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadEvents() {
    try {
      const response = await api.get("/events");
      setEvents(response.data);
    } catch {
      setError("Unable to load events.");
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function createEvent(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/events", {
        ...form,
        maxSeats: Number(form.maxSeats)
      });

      setForm({ name: "", date: "", time: "", maxSeats: "" });
      setMessage("Event created successfully.");
      loadEvents();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create event.");
    }
  }

  async function viewAttendees(eventId) {
    setError("");

    try {
      const response = await api.get(`/events/${eventId}/attendees`);
      setAttendees(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load attendees.");
    }
  }

  return (
    <>
      <Navbar title="PRMCEAM Events" />

      <main className="dashboard">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Admin Dashboard</span>
            <h1>Manage College Events</h1>
            <p>Create an event and keep track of registrations.</p>
          </div>
        </div>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <section className="dashboard-grid">
          <div className="panel">
            <h2>Create Event</h2>
            <form className="form" onSubmit={createEvent}>
              <label>
                Event Name
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="e.g. Tech Fest 2026"
                  required
                />
              </label>

              <div className="two-columns">
                <label>
                  Date
                  <input type="date" name="date" value={form.date} onChange={updateField} required />
                </label>

                <label>
                  Time
                  <input type="time" name="time" value={form.time} onChange={updateField} required />
                </label>
              </div>

              <label>
                Maximum Seats
                <input
                  type="number"
                  name="maxSeats"
                  value={form.maxSeats}
                  onChange={updateField}
                  min="1"
                  placeholder="100"
                  required
                />
              </label>

              <button className="btn btn-primary btn-full">Publish Event</button>
            </form>
          </div>

          <div className="panel">
            <div className="panel-title-row">
              <div>
                <h2>Published Events</h2>
                <p>{events.length} event{events.length === 1 ? "" : "s"} published</p>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="empty">No events yet. Create your first event.</div>
            ) : (
              <div className="event-list">
                {events.map((event) => (
                  <article className="event-item" key={event._id}>
                    <div className="event-main">
                      <span className="event-date">{event.date}</span>
                      <h3>{event.name}</h3>
                      <p>{event.time} · {event.registeredCount} registered</p>
                    </div>

                    <div className="event-stats">
                      <strong>{event.remainingSeats}</strong>
                      <span>remaining</span>
                    </div>

                    <button
                      className="btn btn-light"
                      onClick={() => viewAttendees(event._id)}
                    >
                      Attendees
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {attendees && (
          <section className="panel attendee-panel">
            <div className="panel-title-row">
              <div>
                <h2>{attendees.event.name}</h2>
                <p>{attendees.event.date} · {attendees.event.time}</p>
              </div>
              <button className="btn btn-light" onClick={() => setAttendees(null)}>Close</button>
            </div>

            {attendees.attendees.length === 0 ? (
              <div className="empty">No students have registered yet.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.attendees.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{new Date(student.registeredAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
