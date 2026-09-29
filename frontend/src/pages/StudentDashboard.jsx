import React from "react";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api";

export default function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [eventsResponse, registrationsResponse] = await Promise.all([
        api.get("/events"),
        api.get("/registrations/my")
      ]);

      setEvents(eventsResponse.data);
      setMyRegistrations(registrationsResponse.data);
    } catch {
      setError("Unable to load dashboard data.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function register(eventId) {
    setMessage("");
    setError("");

    try {
      const response = await api.post(`/registrations/${eventId}`);
      setMessage(response.data.message);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register.");
    }
  }

  const registeredIds = new Set(
    myRegistrations
      .map((item) => item.event?._id)
      .filter(Boolean)
  );

  return (
    <>
      <Navbar title="PRMCEAM Events" />

      <main className="dashboard">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Student Dashboard</span>
            <h1>Upcoming Events</h1>
            <p>Find an event and reserve your seat.</p>
          </div>
          <div className="summary-pill">
            <strong>{myRegistrations.length}</strong>
            <span>registered</span>
          </div>
        </div>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <section className="student-events">
          {events.length === 0 ? (
            <div className="panel empty">No events are available right now.</div>
          ) : (
            events.map((event) => {
              const alreadyRegistered = registeredIds.has(event._id);
              const full = event.remainingSeats === 0;

              return (
                <article className="student-event-card" key={event._id}>
                  <div className="calendar-block">
                    <span>{event.date.slice(5, 7)}</span>
                    <strong>{event.date.slice(8, 10)}</strong>
                  </div>

                  <div className="student-event-content">
                    <span className="eyebrow">{event.date}</span>
                    <h2>{event.name}</h2>
                    <p>{event.time}</p>

                    <div className="seat-row">
                      <span className={full ? "seat-full" : "seat-open"}>
                        {full ? "Fully booked" : `${event.remainingSeats} seats available`}
                      </span>
                      <span>{event.registeredCount}/{event.maxSeats} registered</span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    disabled={full || alreadyRegistered}
                    onClick={() => register(event._id)}
                  >
                    {alreadyRegistered ? "Registered" : full ? "Full" : "Register"}
                  </button>
                </article>
              );
            })
          )}
        </section>

        <section className="panel my-events">
          <h2>My Registrations</h2>

          {myRegistrations.length === 0 ? (
            <p className="muted">You have not registered for an event yet.</p>
          ) : (
            <div className="registration-list">
              {myRegistrations.map((registration) => (
                <div className="registration-row" key={registration._id}>
                  <div>
                    <strong>{registration.event?.name}</strong>
                    <span>{registration.event?.date} · {registration.event?.time}</span>
                  </div>
                  <span className="status-badge">Confirmed</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
