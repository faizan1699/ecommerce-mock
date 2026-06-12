let allProducts = [];

async function loadProducts() {
  const grid = document.getElementById("productGrid");
  try {
    const res = await fetch(`${API}/products`);
    allProducts = await res.json();
    populateCategories();
    renderProducts(allProducts);
  } catch (err) {
    grid.innerHTML = `<div class="empty">⚠️ Could not load products.<br>Make sure json-server is running on port 3000.</div>`;
    console.error(err);
  }
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;
  const cats = [...new Set(allProducts.map((p) => p.category))];
  cats.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

function renderProducts(list) {
  const grid = document.getElementById("productGrid");
  if (!list.length) {
    grid.innerHTML = `<div class="empty">No products found.</div>`;
    return;
  }
  grid.innerHTML = list
    .map(
      (p) => `
    <div class="card">
      <img src="${p.image}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
      <div class="card-body">
        <span class="card-cat">${p.category}</span>
        <div class="card-title">${p.title}</div>
        <div class="card-desc">${p.description || ""}</div>
        <div class="card-price">${money(p.price)}</div>
        <button class="btn btn-block" onclick="handleAddToCart(${p.id})">Add to Cart</button>
      </div>
    </div>`
    )
    .join("");
}

function handleAddToCart(id) {
  const user = getCurrentUser();
  if (!user) {
    showToast("Please login first", "error");
    setTimeout(() => (window.location.href = "login.html"), 1000);
    return;
  }
  const product = allProducts.find((p) => p.id === id);
  addToCart(product, 1);
  showToast(`${product.title} added to cart`, "success");
}

function applyFilters() {
  const search = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const cat = document.getElementById("categoryFilter")?.value || "";
  const sort = document.getElementById("sortSelect")?.value || "";

  let list = allProducts.filter(
    (p) =>
      p.title.toLowerCase().includes(search) &&
      (cat === "" || p.category === cat)
  );

  if (sort === "low") list.sort((a, b) => a.price - b.price);
  if (sort === "high") list.sort((a, b) => b.price - a.price);

  renderProducts(list);
}

document.getElementById("searchInput")?.addEventListener("input", applyFilters);
document.getElementById("categoryFilter")?.addEventListener("change", applyFilters);
document.getElementById("sortSelect")?.addEventListener("change", applyFilters);

loadProducts();
