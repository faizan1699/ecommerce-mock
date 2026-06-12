let selectedMethod = "jazzcash";

if (requireAuth()) {
  initCheckout();
}

function initCheckout() {
  const cart = getCart();
  if (!cart.length) {
    window.location.href = "cart.html";
    return;
  }

  const user = getCurrentUser();
  document.getElementById("custName").value = user.name || "";
  document.getElementById("custEmail").value = user.email || "";

  renderOrderSummary();
  setupPaymentMethods();
  togglePaymentFields();
}

function renderOrderSummary() {
  const cart = getCart();
  const subtotal = cartTotal();
  const shipping = 200;
  const rows = cart
    .map(
      (i) =>
        `<div class="summary-row"><span>${i.title} × ${i.qty}</span><span>${money(
          i.price * i.qty
        )}</span></div>`
    )
    .join("");

  document.getElementById("summary").innerHTML = `
    <h3>Order Summary</h3>
    ${rows}
    <div class="summary-row"><span>Shipping</span><span>${money(shipping)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${money(subtotal + shipping)}</span></div>
  `;
}

function setupPaymentMethods() {
  document.querySelectorAll(".pay-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".pay-option").forEach((o) => o.classList.remove("active"));
      opt.classList.add("active");
      selectedMethod = opt.dataset.method;
      togglePaymentFields();
    });
  });
}

function togglePaymentFields() {
  const walletFields = document.getElementById("walletFields");
  const label = document.getElementById("walletLabel");
  if (selectedMethod === "cod") {
    walletFields.style.display = "none";
  } else {
    walletFields.style.display = "block";
    label.textContent =
      selectedMethod === "jazzcash" ? "JazzCash Mobile Number" : "EasyPaisa Mobile Number";
  }
}

const checkoutForm = document.getElementById("checkoutForm");
checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("custName").value.trim();
  const email = document.getElementById("custEmail").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();

  if (!name || !phone || !address) {
    showToast("Please fill all delivery details", "error");
    return;
  }

  if (selectedMethod !== "cod") {
    const wallet = document.getElementById("walletNumber").value.trim();
    if (!/^03\d{9}$/.test(wallet)) {
      showToast("Enter a valid mobile number (03XXXXXXXXX)", "error");
      return;
    }
  }

  const btn = document.getElementById("placeOrderBtn");
  btn.disabled = true;
  btn.textContent = selectedMethod === "cod" ? "Placing order..." : "Processing payment...";

  const user = getCurrentUser();
  const cart = getCart();
  const subtotal = cartTotal();
  const shipping = 200;

  const order = {
    userId: user.id,
    customer: { name, email, phone, address },
    items: cart,
    subtotal,
    shipping,
    total: subtotal + shipping,
    paymentMethod: selectedMethod,
    paymentStatus: selectedMethod === "cod" ? "Pending (COD)" : "Paid (Simulated)",
    status: "Confirmed",
    date: new Date().toISOString(),
  };

  await new Promise((r) => setTimeout(r, selectedMethod === "cod" ? 400 : 1500));

  try {
    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    const saved = await res.json();
    clearCart();

    document.getElementById("checkoutMain").innerHTML = `
      <div class="success-box">
        <div class="check">✓</div>
        <h2>Order Confirmed!</h2>
        <p style="color:var(--muted);margin:10px 0 4px">Order #${saved.id}</p>
        <p style="margin-bottom:6px"><strong>${money(order.total)}</strong> · ${methodLabel(
      selectedMethod
    )}</p>
        <p style="color:var(--muted);font-size:14px;margin-bottom:20px">${order.paymentStatus}</p>
        <a href="index.html" class="btn btn-block">Continue Shopping</a>
      </div>`;
  } catch (err) {
    showToast("Could not place order — is json-server running?", "error");
    btn.disabled = false;
    btn.textContent = "Place Order";
    console.error(err);
  }
});

function methodLabel(m) {
  return m === "jazzcash" ? "JazzCash" : m === "easypaisa" ? "EasyPaisa" : "Cash on Delivery";
}
