const products = [
  { id: 1, name: "Nova Wireless Headphones", category: "Electronics", price: 89, rating: 4.6, tag: "wireless", media: "electronics", image: "assets/products/headphones.png" },
  { id: 2, name: "Pulse Smart Watch", category: "Electronics", price: 129, rating: 4.4, tag: "fitness", media: "electronics", image: "assets/products/smart-watch.png" },
  { id: 3, name: "Aero Running Sneakers", category: "Fashion", price: 76, rating: 4.7, tag: "running", media: "fashion", image: "assets/products/sneakers.png" },
  { id: 4, name: "Canvas Everyday Tote", category: "Fashion", price: 34, rating: 4.2, tag: "travel", media: "fashion", image: "assets/products/tote.png" },
  { id: 5, name: "Glow Vitamin Serum", category: "Beauty", price: 42, rating: 4.8, tag: "skincare", media: "beauty", image: "assets/products/serum.png" },
  { id: 6, name: "Mineral Matte Sunscreen", category: "Beauty", price: 28, rating: 4.3, tag: "skincare", media: "beauty", image: "assets/products/sunscreen.png" },
  { id: 7, name: "Ceramic Dinner Set", category: "Home", price: 64, rating: 4.5, tag: "kitchen", media: "home", image: "assets/products/dinner-set.png" },
  { id: 8, name: "Compact Air Purifier", category: "Home", price: 158, rating: 4.6, tag: "home", media: "home", image: "assets/products/air-purifier.png" },
  { id: 9, name: "Organic Snack Box", category: "Grocery", price: 24, rating: 4.1, tag: "snacks", media: "grocery", image: "assets/products/snack-box.png" },
  { id: 10, name: "Cold Brew Starter Kit", category: "Grocery", price: 49, rating: 4.4, tag: "kitchen", media: "grocery", image: "assets/products/cold-brew.png" }
];

const translations = {
  en: {
    catalog: "Featured Products",
    filters: "Filters",
    cart: "Cart",
    empty: "No products match these filters.",
    order: "Order placed successfully. We sent a confirmation to your contact details."
  },
  hi: {
    catalog: "Featured Products",
    filters: "Filters",
    cart: "Cart",
    empty: "No products match these filters.",
    order: "Order placed successfully. We sent a confirmation to your contact details."
  },
  ta: {
    catalog: "Featured Products",
    filters: "Filters",
    cart: "Cart",
    empty: "No products match these filters.",
    order: "Order placed successfully. We sent a confirmation to your contact details."
  }
};

const state = {
  category: "All",
  search: "",
  price: "all",
  rating: 0,
  sort: "featured",
  cart: {}
};

const categoryList = document.querySelector("#categoryList");
const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const catalogTitle = document.querySelector("#catalogTitle");
const cartCount = document.querySelector("#cartCount");
const cartModal = document.querySelector("#cartModal");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const checkoutForm = document.querySelector("#checkoutForm");
const orderMessage = document.querySelector("#orderMessage");

function money(value) {
  return `$${value.toFixed(2)}`;
}

function getCategories() {
  return ["All", ...new Set(products.map((product) => product.category))];
}

function renderCategories() {
  categoryList.innerHTML = getCategories().map((category) => {
    const active = category === state.category ? "active" : "";
    return `<button class="${active}" type="button" data-category="${category}">${category}</button>`;
  }).join("");
}

function matchesPrice(product) {
  if (state.price === "under50") return product.price < 50;
  if (state.price === "50to150") return product.price >= 50 && product.price <= 150;
  if (state.price === "over150") return product.price > 150;
  return true;
}

function getFilteredProducts() {
  const search = state.search.trim().toLowerCase();
  let result = products.filter((product) => {
    const categoryMatch = state.category === "All" || product.category === state.category;
    const searchMatch = !search || `${product.name} ${product.category} ${product.tag}`.toLowerCase().includes(search);
    return categoryMatch && searchMatch && matchesPrice(product) && product.rating >= state.rating;
  });

  if (state.sort === "low") result = result.sort((a, b) => a.price - b.price);
  if (state.sort === "high") result = result.sort((a, b) => b.price - a.price);
  if (state.sort === "rating") result = result.sort((a, b) => b.rating - a.rating);
  return result;
}

function renderProducts() {
  const filtered = getFilteredProducts();
  catalogTitle.textContent = state.category === "All" ? translations.en.catalog : state.category;

  if (!filtered.length) {
    productGrid.innerHTML = `<p class="empty-state">${translations.en.empty}</p>`;
    return;
  }

  productGrid.innerHTML = filtered.map((product) => {
    const quantity = state.cart[product.id] || 0;
    const cartLabel = quantity ? `In Cart (${quantity})` : "Add to Cart";
    const cartClass = quantity ? "add-cart in-cart" : "add-cart";
    return `
    <article class="product-card">
      <div class="product-media media-${product.media}">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-body">
        <div class="product-meta">
          <span>${product.category}</span>
          <span>${product.rating.toFixed(1)} stars</span>
        </div>
        <h3>${product.name}</h3>
        <div class="price-row">
          <span class="price">${money(product.price)}</span>
          <button class="${cartClass}" type="button" data-add="${product.id}">${cartLabel}</button>
        </div>
      </div>
    </article>
  `;
  }).join("");
}

function cartEntries() {
  return Object.entries(state.cart).map(([id, quantity]) => {
    const product = products.find((item) => item.id === Number(id));
    return { ...product, quantity };
  });
}

function renderCart() {
  const entries = cartEntries();
  const count = entries.reduce((sum, item) => sum + item.quantity, 0);
  const total = entries.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = count;
  cartTotal.textContent = money(total);

  if (!entries.length) {
    cartItems.innerHTML = `<p class="empty-state">Your cart is empty.</p>`;
    checkoutForm.hidden = true;
    return;
  }

  cartItems.innerHTML = entries.map((item) => `
    <div class="cart-item">
      <div>
        <h3>${item.name}</h3>
        <span>${money(item.price)} each</span>
      </div>
      <div class="quantity-row">
        <button type="button" data-decrease="${item.id}" aria-label="Decrease ${item.name}">-</button>
        <strong>${item.quantity}</strong>
        <button type="button" data-increase="${item.id}" aria-label="Increase ${item.name}">+</button>
        <button class="remove-item" type="button" data-remove="${item.id}">Remove</button>
      </div>
    </div>
  `).join("");
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  renderCart();
  renderProducts();
}

function updateCart(id, quantity) {
  if (quantity <= 0) {
    delete state.cart[id];
  } else {
    state.cart[id] = quantity;
  }
  renderCart();
  renderProducts();
}

function resetFilters() {
  state.category = "All";
  state.search = "";
  state.price = "all";
  state.rating = 0;
  state.sort = "featured";
  searchInput.value = "";
  sortSelect.value = "featured";
  document.querySelector('input[name="price"][value="all"]').checked = true;
  document.querySelector('input[name="rating"][value="0"]').checked = true;
  renderCategories();
  renderProducts();
}

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  renderCategories();
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  addToCart(button.dataset.add);
});

document.querySelectorAll('input[name="price"]').forEach((input) => {
  input.addEventListener("change", () => {
    state.price = input.value;
    renderProducts();
  });
});

document.querySelectorAll('input[name="rating"]').forEach((input) => {
  input.addEventListener("change", () => {
    state.rating = Number(input.value);
    renderProducts();
  });
});

searchInput.addEventListener("input", () => {
  state.search = searchInput.value;
  renderProducts();
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  renderProducts();
});

document.querySelector("#clearFilters").addEventListener("click", resetFilters);

document.querySelectorAll("[data-search]").forEach((button) => {
  button.addEventListener("click", () => {
    state.search = button.dataset.search;
    searchInput.value = state.search;
    document.querySelectorAll("[data-search]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderProducts();
  });
});

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const header = document.querySelector(".site-header");
  header.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", header.classList.contains("open"));
});

document.querySelector("#openCart").addEventListener("click", () => {
  renderCart();
  cartModal.showModal();
});

document.querySelector("#closeCart").addEventListener("click", () => cartModal.close());

cartItems.addEventListener("click", (event) => {
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");
  const remove = event.target.closest("[data-remove]");
  if (increase) updateCart(increase.dataset.increase, state.cart[increase.dataset.increase] + 1);
  if (decrease) updateCart(decrease.dataset.decrease, state.cart[decrease.dataset.decrease] - 1);
  if (remove) updateCart(remove.dataset.remove, 0);
});

document.querySelector("#checkoutButton").addEventListener("click", () => {
  if (!cartEntries().length) return;
  checkoutForm.hidden = false;
  checkoutForm.scrollIntoView({ block: "nearest" });
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  orderMessage.textContent = translations.en.order;
  state.cart = {};
  renderCart();
  renderProducts();
  checkoutForm.hidden = false;
});

document.querySelector("#filterToggle").addEventListener("click", (event) => {
  const filters = document.querySelector(".filters");
  filters.classList.toggle("filters-open");
  const isOpen = filters.classList.contains("filters-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  event.currentTarget.textContent = isOpen ? "Hide Filters" : "Show Filters";
});

const supportPanel = document.querySelector("#supportPanel");
const supportToggle = document.querySelector("#supportToggle");

supportToggle.addEventListener("click", () => {
  supportPanel.hidden = !supportPanel.hidden;
  supportToggle.setAttribute("aria-expanded", String(!supportPanel.hidden));
});

document.querySelector("#closeSupport").addEventListener("click", () => {
  supportPanel.hidden = true;
  supportToggle.setAttribute("aria-expanded", "false");
});

document.querySelectorAll("[data-chat]").forEach((button) => {
  button.addEventListener("click", () => {
    appendChat(button.dataset.chat, "user");
  });
});

document.querySelector("#chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#chatInput");
  if (!input.value.trim()) return;
  appendChat(input.value.trim(), "user");
  input.value = "";
});

function appendChat(text, type) {
  const message = document.createElement("p");
  message.className = `chat-message ${type}`;
  message.textContent = text;
  document.querySelector(".chat-body").appendChild(message);
}

document.querySelector("#languageSelect").addEventListener("change", (event) => {
  const selected = translations[event.target.value] || translations.en;
  catalogTitle.textContent = selected.catalog;
});

renderCategories();
renderProducts();
renderCart();
