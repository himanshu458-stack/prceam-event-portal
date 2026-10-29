

import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api";

export default function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setError("");

    try {
      const [eventsResponse, registrationsResponse] = await Promise.all([
        api.get("/events"),
        api.get("/registrations/my")
      ]);

      setEvents(eventsResponse.data);
      setMyRegistrations(registrationsResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
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
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register.");
    }
  }

  const registeredIds = useMemo(
    () =>
      new Set(
        myRegistrations
          .map((item) => String(item.event?.id ?? item.event?._id ?? ""))
          .filter(Boolean)
      ),
    [myRegistrations]
  );

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const eventId = String(event.id ?? event._id);
      const date = String(event.date ?? "").slice(0, 10);
      const name = String(event.name ?? "").toLowerCase();
      const matchesSearch =
        name.includes(query) || date.includes(query);

      const isRegistered = registeredIds.has(eventId);
      const isFull = Number(event.remainingSeats) <= 0;

      const matchesFilter =
        filter === "all" ||
        (filter === "available" && !isFull) ||
        (filter === "full" && isFull) ||
        (filter === "registered" && isRegistered);

      return matchesSearch && matchesFilter;
    });
  }, [events, search, filter, registeredIds]);

  const availableCount = events.filter(
    (event) => Number(event.remainingSeats) > 0
  ).length;

  return (
    <>
      <Navbar title="PRMCEAM Events" />

      <main className="dashboard">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Student Dashboard</span>
            <h1>Discover Campus Events ✨</h1>
            <p>Find something exciting and reserve your seat.</p>
          </div>

          <div className="summary-pill">
            <strong>{myRegistrations.length}</strong>
            <span>My registrations</span>
          </div>
        </div>

        <section className="student-stats">
          <div className="student-stat stat-purple">
            <span className="stat-icon">🎉</span>
            <span className="stat-label">Total events</span>
            <strong>{events.length}</strong>
            <span className="stat-caption">Campus experiences</span>
          </div>

          <div className="student-stat stat-mint">
            <span className="stat-icon">🎟️</span>
            <span className="stat-label">Open events</span>
            <strong>{availableCount}</strong>
            <span className="stat-caption">Seats still available</span>
          </div>

          <div className="student-stat stat-coral">
            <span className="stat-icon">⭐</span>
            <span className="stat-label">Your bookings</span>
            <strong>{myRegistrations.length}</strong>
            <span className="stat-caption">Events you've joined</span>
          </div>
        </section>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <section className="event-explorer">
          <div className="explorer-heading">
            <div>
              <span className="eyebrow">Find your next experience</span>
              <h2>Explore events</h2>
            </div>
            <span className="result-count">
              {filteredEvents.length} found
            </span>
          </div>

          <div className="event-filters">
            <label className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search by event name or date..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="filter-control">
              <span>Show</span>
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="all">All events</option>
                <option value="available">Seats available</option>
                <option value="full">Fully booked</option>
                <option value="registered">My registered events</option>
              </select>
            </label>
          </div>
        </section>

        <section className="student-events">
          {loading ? (
            <div className="panel empty">Loading campus events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="panel empty">
              <div className="empty-emoji">🔎</div>
              <h2>No matching events</h2>
              <p>Try another search or change the filter.</p>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const eventId = String(event.id ?? event._id);
              const alreadyRegistered = registeredIds.has(eventId);
              const full = Number(event.remainingSeats) <= 0;
              const date = String(event.date ?? "").slice(0, 10);
              const month = date.slice(5, 7);
              const day = date.slice(8, 10);

              return (
                <article className="student-event-card" key={eventId}>
                  <div className="calendar-block">
                    <span>{month}</span>
                    <strong>{day}</strong>
                  </div>

                  <div className="student-event-content">
                    <span className="eyebrow">{date}</span>
                    <h2>{event.name}</h2>
                    <p>🕒 {String(event.time ?? "").slice(0, 5)}</p>

                    <div className="seat-row">
                      <span className={full ? "seat-full" : "seat-open"}>
                        {full
                          ? "Fully booked"
                          : `${event.remainingSeats} seats available`}
                      </span>
                      <span>
                        {event.registeredCount}/{event.maxSeats} registered
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    disabled={full || alreadyRegistered}
                    onClick={() => register(eventId)}
                  >
                    {alreadyRegistered
                      ? "✓ Registered"
                      : full
                      ? "Fully booked"
                      : "Reserve seat →"}
                  </button>
                </article>
              );
            })
          )}
        </section>

        <section className="panel my-events">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow">Your activity</span>
              <h2>My Registrations</h2>
            </div>
            <span className="result-count">
              {myRegistrations.length} total
            </span>
          </div>

          {myRegistrations.length === 0 ? (
            <p className="muted">
              You haven't registered for an event yet. Explore events above!
            </p>
          ) : (
            <div className="registration-list">
              {myRegistrations.map((registration) => (
                <div
                  className="registration-row"
                  key={registration.id ?? registration._id}
                >
                  <div>
                    <strong>{registration.event?.name}</strong>
                    <span>
                      {String(registration.event?.date ?? "").slice(0, 10)}
                      {" · "}
                      {String(registration.event?.time ?? "").slice(0, 5)}
                    </span>
                  </div>
                  <span className="status-badge">✓ Confirmed</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
