import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ title = "College Event Portal" }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        {title}
      </Link>

      <div className="nav-right">
        {user && <span className="user-chip">{user.name} · {user.role}</span>}
        {user ? (
          <button className="btn btn-outline" onClick={logout}>Logout</button>
        ) : (
          <Link className="btn btn-outline" to="/">Home</Link>
        )}
      </div>
    </header>
  );
}
