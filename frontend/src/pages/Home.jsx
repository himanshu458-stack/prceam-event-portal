import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-badge">PRMCEAM • College Event Portal</div>
        <h1>Plan. Publish. Participate.</h1>
        <p>
          A simple college event platform where admins publish events and
          students reserve available seats.
        </p>
      </section>

      <section className="role-grid">
        <article className="role-card">
          <div className="role-icon">A</div>
          <h2>Admin</h2>
          <p>Create events, track registrations, remaining seats and attendees.</p>
          <div className="button-row">
            <Link className="btn btn-primary" to="/admin/login">Admin Login</Link>
            <Link className="btn btn-light" to="/admin/register">Register</Link>
          </div>
        </article>

        <article className="role-card">
          <div className="role-icon">S</div>
          <h2>Student</h2>
          <p>Explore upcoming events and register while seats are available.</p>
          <div className="button-row">
            <Link className="btn btn-primary" to="/student/login">Student Login</Link>
            <Link className="btn btn-light" to="/student/register">Register</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
