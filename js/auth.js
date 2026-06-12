const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!name || !email || !password) {
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      const check = await fetch(`${API}/users?email=${encodeURIComponent(email)}`);
      const existing = await check.json();
      if (existing.length > 0) {
        showToast("Email already registered", "error");
        return;
      }

      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const user = await res.json();
      const { password: _, ...safe } = user;
      setCurrentUser(safe);
      showToast("Account created!", "success");
      setTimeout(() => (window.location.href = "index.html"), 1000);
    } catch (err) {
      showToast("Server error — is json-server running?", "error");
      console.error(err);
    }
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(
        `${API}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      );
      const users = await res.json();
      if (users.length === 0) {
        showToast("Invalid email or password", "error");
        return;
      }
      const { password: _, ...safe } = users[0];
      setCurrentUser(safe);
      showToast("Welcome back!", "success");
      setTimeout(() => {
        window.location.href = safe.role === "admin" ? "admin.html" : "index.html";
      }, 800);
    } catch (err) {
      showToast("Server error — is json-server running?", "error");
      console.error(err);
    }
  });
}
