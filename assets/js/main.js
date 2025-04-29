// Product data (hardcoded for demo)
const products = [
  {
    id: 1,
    name: "Formal Shirt",
    category: "Clothing",
    price: 19.99,
    bestSelling: true,
    image: "https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description: "A stylish formal shirt perfect for office and events."
  },
  {
    id: 2,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 99.99,
    bestSelling: false,
    image: "https://images.pexels.com/photos/3394663/pexels-photo-3394663.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description: "High-quality wireless headphones with noise cancellation."
  },
  {
    id: 3,
    name: "Running Shoes",
    category: "Footwear",
    price: 59.99,
    bestSelling: true,
    image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description: "Lightweight running shoes designed for comfort and performance."
  },
  {
    id: 4,
    name: "Smart Watch",
    category: "Electronics",
    price: 149.99,
    bestSelling: false,
    image: "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    description: "Stay connected with this sleek and stylish smart watch."
  }
];

// Utility functions for localStorage
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// DOM Elements
const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");
const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const checkoutModal = document.getElementById("checkout-modal");
const closeModalBtn = document.getElementById("close-modal-btn");

// State
let filteredProducts = [];
let favorites = getFavorites();
let cart = getCart();

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (productGrid) {
    // Homepage logic
    showSkeletonLoading();
    setTimeout(() => {
      filteredProducts = [...products];
      renderProducts(filteredProducts);
      updateCartCount();
    }, 1500);

    searchInput.addEventListener("input", handleSearch);
    filterButtons.forEach(btn => btn.addEventListener("click", handleFilter));

    // Dropdown price sort change event
    const priceSortSelect = document.getElementById("price-sort");
    priceSortSelect.addEventListener("change", (e) => {
      const value = e.target.value;
      if (value === "price-low-high") {
        filteredProducts = [...products].sort((a, b) => a.price - b.price);
      } else if (value === "price-high-low") {
        filteredProducts = [...products].sort((a, b) => b.price - a.price);
      } else if (value === "newest") {
        filteredProducts = [...products].sort((a, b) => b.id - a.id);
      } else if (value === "popularity") {
        filteredProducts = [...products].sort((a, b) => (b.bestSelling === true) - (a.bestSelling === true));
      } else if (value === "discount") {
        // No discount data available, so just show all products
        filteredProducts = [...products];
      } else {
        filteredProducts = [...products];
      }
      renderProducts(filteredProducts);
    });

    // Wishlist button and modal logic
    const wishlistBtn = document.getElementById("wishlist-btn");
    const wishlistModal = document.getElementById("wishlist-modal");
    const closeWishlistBtn = document.getElementById("close-wishlist");
    const wishlistItemsContainer = document.getElementById("wishlist-items");
    const emptyWishlistMessage = document.getElementById("empty-wishlist");

    function renderWishlist() {
      wishlistItemsContainer.innerHTML = "";
      const favoriteIds = getFavorites();
      if (favoriteIds.length === 0) {
        emptyWishlistMessage.classList.remove("hidden");
        return;
      } else {
        emptyWishlistMessage.classList.add("hidden");
      }
      favoriteIds.forEach(id => {
        const product = products.find(p => p.id === id);
        if (!product) return;
        const card = document.createElement("div");
        card.className = "product-card bg-white rounded-lg shadow-md p-4 cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-xl hover:-rotate-1 flex flex-col";

        card.innerHTML = `
          <img src="${product.image}" alt="${product.name}" class="rounded-md object-cover h-48 w-full mb-4" />
          <h3 class="text-lg font-semibold text-gray-800 mb-2">${product.name}</h3>
          <p class="text-pink-500 font-bold mb-2">$${product.price.toFixed(2)}</p>
          <div class="flex justify-between items-center mt-auto">
            <button class="add-to-cart-btn bg-pastel-pink text-white px-3 py-1 rounded-md hover:bg-pink-600 transition" data-id="${product.id}">Add to Cart</button>
            <button class="favorite-btn text-pink-500 hover:text-pink-700 transition" data-id="${product.id}">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        `;

        // Add event listeners for buttons
        card.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          addToCart(product.id);
        });

        card.querySelector(".favorite-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          toggleFavorite(product.id, e.target.closest("button"));
          renderWishlist(); // Update wishlist after toggle
          renderProducts(filteredProducts); // Update main product grid icons
        });

        card.addEventListener("click", () => {
          window.location.href = `product.html?id=${product.id}`;
        });

        wishlistItemsContainer.appendChild(card);
      });
    }

    wishlistBtn.addEventListener("click", () => {
      wishlistModal.classList.remove("hidden");
      renderWishlist();
    });

    closeWishlistBtn.addEventListener("click", () => {
      wishlistModal.classList.add("hidden");
    });
  }

  if (cartItemsContainer) {
    // Cart page logic
    renderCartItems();
    updateCartTotal();
    updateCartCount();
    checkoutBtn.addEventListener("click", openCheckoutModal);
    closeModalBtn.addEventListener("click", closeCheckoutModal);
  }

  if (window.location.pathname.endsWith("product.html")) {
    // Product detail page logic
    loadProductDetail();
  }
});

// Functions

function showSkeletonLoading() {
  productGrid.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-card rounded-lg p-4 bg-white shadow-md animate-pulse";
    productGrid.appendChild(skeleton);
  }
}

function renderProducts(productsToRender) {
  productGrid.innerHTML = "";
  if (productsToRender.length === 0) {
    productGrid.innerHTML = "<p class='text-center col-span-full text-gray-500'>No products found.</p>";
    return;
  }
  productsToRender.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card bg-white rounded-lg shadow-md p-4 cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-xl hover:-rotate-1 flex flex-col";

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="rounded-md object-cover h-48 w-full mb-4" />
      <h3 class="text-lg font-semibold text-gray-800 mb-1">${product.name}</h3>
      <p class="text-gray-600 text-sm mb-2">${product.description}</p>
      <div class="flex items-center mb-2 space-x-1 text-yellow-400">
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star"></i>
        <i class="fas fa-star-half-alt"></i>
        <span class="text-gray-500 text-xs ml-2">(120 reviews)</span>
      </div>
      <p class="text-pink-500 font-bold mb-2">$${product.price.toFixed(2)}</p>
      <div class="flex justify-between items-center mt-auto">
        <button class="add-to-cart-btn bg-pastel-pink text-white px-3 py-1 rounded-md hover:bg-pink-600 transition" data-id="${product.id}">Add to Cart</button>
        <button class="favorite-btn text-pink-500 hover:text-pink-700 transition" data-id="${product.id}">
          <i class="${favorites.includes(product.id) ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
    `;


    // Click on card navigates to product detail page
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("add-to-cart-btn") || e.target.closest(".add-to-cart-btn") || e.target.classList.contains("favorite-btn") || e.target.closest(".favorite-btn")) {
        return; // Prevent navigation if clicking buttons
      }
      window.location.href = `product.html?id=${product.id}`;
    });

    // Add to cart button
    card.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(product.id);
    });

    // Favorite button
    card.querySelector(".favorite-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(product.id, e.target.closest("button"));
    });

    productGrid.appendChild(card);
  });
}

function handleSearch() {
  const query = searchInput.value.toLowerCase();
  filteredProducts = products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
  renderProducts(filteredProducts);
}

function handleFilter(e) {
  const filter = e.target.getAttribute("data-filter");
  if (filter === "all") {
    filteredProducts = [...products];
  } else if (filter === "price-low-high") {
    filteredProducts = [...products].sort((a, b) => a.price - b.price);
  } else if (filter === "best-selling") {
    filteredProducts = [...products].filter(p => p.bestSelling);
  }
  renderProducts(filteredProducts);
}

function addToCart(productId) {
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
  alert("Product added to cart!");
}

function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  if (cartCount) {
    cartCount.textContent = count;
  }
}

function toggleFavorite(productId, button) {
  if (favorites.includes(productId)) {
    favorites = favorites.filter(id => id !== productId);
  } else {
    favorites.push(productId);
  }
  saveFavorites(favorites);
  const icon = button.querySelector("i");
  if (icon) {
    icon.classList.toggle("fas");
    icon.classList.toggle("far");
  }
}

function renderCartItems() {
  cartItemsContainer.innerHTML = "";
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p class='text-center text-gray-500'>Your cart is empty.</p>";
    return;
  }
  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return;
    const cartItem = document.createElement("div");
    cartItem.className = "bg-white rounded-lg shadow-md p-4 flex items-center space-x-4";

    cartItem.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="w-20 h-20 object-cover rounded-md" />
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-800">${product.name}</h3>
        <p class="text-pink-500 font-bold">$${product.price.toFixed(2)}</p>
      </div>
      <div class="flex items-center space-x-2">
        <button class="quantity-btn bg-gray-200 px-2 rounded" data-id="${item.id}" data-action="decrease">-</button>
        <span>${item.quantity}</span>
        <button class="quantity-btn bg-gray-200 px-2 rounded" data-id="${item.id}" data-action="increase">+</button>
      </div>
      <button class="remove-btn text-red-500 hover:text-red-700" data-id="${item.id}">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;

    cartItemsContainer.appendChild(cartItem);
  });

  // Add event listeners for quantity buttons and remove buttons
  const quantityButtons = cartItemsContainer.querySelectorAll(".quantity-btn");
  quantityButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      const action = btn.getAttribute("data-action");
      updateQuantity(id, action);
    });
  });

  const removeButtons = cartItemsContainer.querySelectorAll(".remove-btn");
  removeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      removeFromCart(id);
    });
  });
}

function updateQuantity(productId, action) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  if (action === "increase") {
    item.quantity++;
  } else if (action === "decrease" && item.quantity > 1) {
    item.quantity--;
  }
  saveCart(cart);
  renderCartItems();
  updateCartTotal();
  updateCartCount();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
  renderCartItems();
  updateCartTotal();
  updateCartCount();
}

function updateCartTotal() {
  const total = cart.reduce((acc, item) => {
    const product = products.find(p => p.id === item.id);
    return product ? acc + product.price * item.quantity : acc;
  }, 0);
  if (cartTotal) {
    cartTotal.textContent = total.toFixed(2);
  }
}

function openCheckoutModal() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  checkoutModal.classList.remove("hidden");
}

function closeCheckoutModal() {
  checkoutModal.classList.add("hidden");
  cart = [];
  saveCart(cart);
  renderCartItems();
  updateCartTotal();
  updateCartCount();
}

function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  const product = products.find(p => p.id === id);
  if (!product) {
    document.getElementById("product-detail").innerHTML = "<p class='text-center text-gray-500'>Product not found.</p>";
    return;
  }
  document.getElementById("product-image").src = product.image;
  document.getElementById("product-name").textContent = product.name;
  document.getElementById("product-description").textContent = product.description;
  document.getElementById("product-price").textContent = `$${product.price.toFixed(2)}`;

  const addToCartBtn = document.getElementById("add-to-cart-btn");
  addToCartBtn.addEventListener("click", () => {
    addToCart(product.id);
    alert("Product added to cart!");
  });
}
