if (requireAdmin()) {
  loadAdminProducts();
  loadAdminOrders();
}

let editingId = null;

async function loadAdminProducts() {
  const tbody = document.getElementById("productRows");
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();
    if (!products.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty">No products yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = products
      .map(
        (p) => `
      <tr>
        <td><img src="${p.image}" onerror="this.src='https://via.placeholder.com/46?text=?'"></td>
        <td>${p.title}</td>
        <td>${p.category}</td>
        <td>${money(p.price)}</td>
        <td>${p.stock ?? "-"}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick='startEdit(${JSON.stringify(
            p
          )})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>`
      )
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty">⚠️ Server not reachable.</td></tr>`;
    console.error(err);
  }
}

const productForm = document.getElementById("productForm");
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const product = {
    title: document.getElementById("title").value.trim(),
    price: Number(document.getElementById("price").value),
    category: document.getElementById("category").value.trim(),
    stock: Number(document.getElementById("stock").value) || 0,
    image:
      document.getElementById("image").value.trim() ||
      "https://picsum.photos/seed/" + Date.now() + "/400/300",
    description: document.getElementById("description").value.trim(),
  };

  if (!product.title || !product.price || !product.category) {
    showToast("Title, price and category are required", "error");
    return;
  }

  try {
    if (editingId) {
      await fetch(`${API}/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...product }),
      });
      showToast("Product updated", "success");
    } else {
      await fetch(`${API}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      showToast("Product added", "success");
    }
    resetForm();
    loadAdminProducts();
  } catch (err) {
    showToast("Could not save — is json-server running?", "error");
    console.error(err);
  }
});

function startEdit(p) {
  editingId = p.id;
  document.getElementById("title").value = p.title;
  document.getElementById("price").value = p.price;
  document.getElementById("category").value = p.category;
  document.getElementById("stock").value = p.stock ?? "";
  document.getElementById("image").value = p.image;
  document.getElementById("description").value = p.description || "";
  document.getElementById("formTitle").textContent = "Edit Product";
  document.getElementById("submitBtn").textContent = "Update Product";
  document.getElementById("cancelEdit").style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  editingId = null;
  productForm.reset();
  document.getElementById("formTitle").textContent = "Add New Product";
  document.getElementById("submitBtn").textContent = "Add Product";
  document.getElementById("cancelEdit").style.display = "none";
}

document.getElementById("cancelEdit").addEventListener("click", resetForm);

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  try {
    await fetch(`${API}/products/${id}`, { method: "DELETE" });
    showToast("Product deleted", "");
    loadAdminProducts();
  } catch (err) {
    showToast("Could not delete", "error");
    console.error(err);
  }
}

async function loadAdminOrders() {
  const tbody = document.getElementById("orderRows");
  try {
    const res = await fetch(`${API}/orders?_sort=id&_order=desc`);
    const orders = await res.json();
    if (!orders.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty">No orders yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = orders
      .map(
        (o) => `
      <tr>
        <td>#${o.id}</td>
        <td>${o.customer?.name || "-"}<br><small style="color:var(--muted)">${
          o.customer?.phone || ""
        }</small></td>
        <td>${o.items?.length || 0} item(s)</td>
        <td>${money(o.total)}</td>
        <td>${methodName(o.paymentMethod)}<br><small style="color:var(--muted)">${
          o.paymentStatus || ""
        }</small></td>
        <td>${new Date(o.date).toLocaleDateString()}</td>
      </tr>`
      )
      .join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty">⚠️ Server not reachable.</td></tr>`;
    console.error(err);
  }
}

function methodName(m) {
  return m === "jazzcash" ? "JazzCash" : m === "easypaisa" ? "EasyPaisa" : "COD";
}
