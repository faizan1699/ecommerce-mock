const IS_LOCAL =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";

const API = IS_LOCAL
  ? "http://localhost:3000"
  : "https://my-json-server.typicode.com/faizan1699/ecommerce-mock";

function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

function requireAuth() {
  if (!getCurrentUser()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    showToast("Admin access required", "error");
    setTimeout(() => (window.location.href = "index.html"), 1200);
    return false;
  }
  return true;
}

function cartKey() {
  const user = getCurrentUser();
  return user ? `cart_${user.id}` : "cart_guest";
}

function getCart() {
  return JSON.parse(localStorage.getItem(cartKey()) || "[]");
}

function saveCart(cart) {
  localStorage.setItem(cartKey(), JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const found = cart.find((i) => i.id === product.id);
  if (found) {
    found.qty += qty;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      qty,
    });
  }
  saveCart(cart);
}

function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function clearCart() {
  localStorage.removeItem(cartKey());
  updateCartBadge();
}

function renderNavbar() {
  const el = document.getElementById("navbar");
  if (!el) return;
  const user = getCurrentUser();

  let links = `<a href="index.html">Shop</a>`;
  if (user) {
    links += `<a href="cart.html">Cart <span class="cart-badge" id="cartBadge">0</span></a>`;
    if (user.role === "admin") {
      links += `<a href="admin.html">Admin</a>`;
    }
    links += `<a href="#" id="logoutBtn">Logout (${user.name.split(" ")[0]})</a>`;
  } else {
    links += `<a href="login.html">Login</a><a href="register.html">Register</a>`;
  }

  el.innerHTML = `
    <div class="nav-inner">
      <a href="index.html" class="logo">🛒 MP Store</a>
      <div class="nav-links">${links}</div>
    </div>`;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (badge) badge.textContent = cartCount();
}

function showToast(message, type = "") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = `toast ${type}`;
  }, 2500);
}

function money(n) {
  return "Rs " + Number(n).toLocaleString("en-PK");
}

document.addEventListener("DOMContentLoaded", renderNavbar);
