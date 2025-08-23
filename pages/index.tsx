import { useState } from "react";

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin1234") {
      setLoggedIn(true);
    } else {
      alert("Nesprávné přihlašovací údaje");
    }
  };

  if (!loggedIn) {
    return (
      <div style={{ padding: "2rem", fontFamily: "Arial" }}>
        <h2>Přihlášení do admin panelu</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Uživatel:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ marginLeft: "1rem" }}
            />
          </div>
          <div style={{ marginTop: "1rem" }}>
            <label>Heslo:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginLeft: "1.9rem" }}
            />
          </div>
          <button type="submit" style={{ marginTop: "1rem" }}>
            Přihlásit se
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Admin rozhraní Tvoje Hnízdo</h1>
      <p>✅ Přihlášen jako <strong>admin</strong></p>
      <p>📝 Tady bude přehled poptávek, PDF export, AI odpovědi atd.</p>
    </div>
  );
}
