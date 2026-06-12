if (requireAuth()) {
  renderCart();
}

function renderCart() {
  const wrap = document.getElementById("cartItems");
  const cart = getCart();

  if (!cart.length) {
    document.getElementById("cartLayout").innerHTML = `
      <div class="empty">
        🛒 Your cart is empty.<br><br>
        <a href="index.html" class="btn">Continue Shopping</a>
      </div>`;
    return;
  }

  wrap.innerHTML = cart
    .map(
      (i) => `
    <div class="cart-item">
      <img src="${i.image}" alt="${i.title}" onerror="this.src='https://via.placeholder.com/80?text=No+Image'">
      <div class="info">
        <div class="card-title">${i.title}</div>
        <div class="card-price">${money(i.price)}</div>
      </div>
      <div class="qty">
        <button onclick="changeQty(${i.id}, -1)">−</button>
        <span>${i.qty}</span>
        <button onclick="changeQty(${i.id}, 1)">+</button>
      </div>
      <div style="min-width:90px;text-align:right;font-weight:700">${money(i.price * i.qty)}</div>
      <button class="btn btn-danger btn-sm" onclick="removeItem(${i.id})">Remove</button>
    </div>`
    )
    .join("");

  renderSummary();
}

function renderSummary() {
  const subtotal = cartTotal();
  const shipping = subtotal > 0 ? 200 : 0;
  document.getElementById("summary").innerHTML = `
    <h3>Order Summary</h3>
    <div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>${money(shipping)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${money(subtotal + shipping)}</span></div>
    <a href="checkout.html" class="btn btn-block" style="margin-top:14px">Proceed to Checkout</a>
    <a href="index.html" class="btn btn-outline btn-block" style="margin-top:10px">Continue Shopping</a>
  `;
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) item.qty = 1;
  saveCart(cart);
  renderCart();
}

function removeItem(id) {
  let cart = getCart();
  cart = cart.filter((i) => i.id !== id);
  saveCart(cart);
  showToast("Item removed", "");
  renderCart();
}
