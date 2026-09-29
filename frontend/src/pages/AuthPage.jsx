import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function AuthPage({ mode, role }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleName = role === "admin" ? "Admin" : "Student";

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await api.post("/auth/register", {
          ...form,
          role
        });

        navigate(`/${role}/login`, {
          state: { message: "Registration successful. Please login." }
        });
      } else {
        const response = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
          role
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        navigate(`/${role}/dashboard`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link className="back-link" to="/">← Back to home</Link>

        <div className="auth-heading">
          <span className="eyebrow">{roleName} Portal</span>
          <h1>{mode === "register" ? `Create ${roleName} Account` : `${roleName} Login`}</h1>
          <p>
            {mode === "register"
              ? `Register as a ${roleName.toLowerCase()} to access the portal.`
              : `Sign in to your ${roleName.toLowerCase()} dashboard.`}
          </p>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={submit} className="form">
          {mode === "register" && (
            <label>
              Full Name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Enter your name"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={updateField}
              placeholder="Minimum 6 characters"
              minLength="6"
              required
            />
          </label>

          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "register" ? "Create Account" : "Login"}
          </button>
        </form>

        <p className="switch-text">
          {mode === "register" ? "Already have an account?" : "Don't have an account?"}{" "}
          <Link to={`/${role}/${mode === "register" ? "login" : "register"}`}>
            {mode === "register" ? "Login" : "Register"}
          </Link>
        </p>
      </div>
    </main>
  );
}
