// Firebase v8 config
const firebaseConfig = {
  apiKey: "AIzaSyALTuDEFOFs-am2LU4OS5HJOQPwEHys-K8",
  authDomain: "paridhi-art-jewellery-149b9.firebaseapp.com",
  projectId: "paridhi-art-jewellery-149b9",
  storageBucket: "paridhi-art-jewellery-149b9.appspot.com",
  messagingSenderId: "249109069877",
  appId: "1:249109069877:web:5b18291ddd0e4830a0317c"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let batches = [];
let currentBatch = null;
let currentProduct = null;

// Load data
async function loadDataAndRender() {
  try {
    const doc = await db.collection("websiteData").doc("batches").get();
    batches = doc.exists ? doc.data().batches : [];
    renderBatches();
  } catch (err) {
    console.error(err);
  }
}

// Render batches
function renderBatches() {
  const container = document.getElementById("batch-list");
  container.innerHTML = "<h2>Collections</h2>";
  if (!batches.length) return container.innerHTML += "<p>No collections yet.</p>";
  
  batches.forEach((batch, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = batch.name;
    card.onclick = () => showProducts(i);
    container.appendChild(card);
  });
}

// Show products of batch
function showProducts(batchIndex) {
  currentBatch = batches[batchIndex];
  document.getElementById("batch-list").classList.add("hidden");
  document.getElementById("product-list").classList.remove("hidden");
  document.getElementById("batchNameHeading").textContent = currentBatch.name;

  const container = document.getElementById("productsContainer");
  container.innerHTML = "";
  currentBatch.products.forEach((product, i) => {
    const card = document.createElement("div");
    card.className = "card product-card";

    const img = document.createElement("img");
    img.src = product.themeImage || 'assets/images/default.jpg';
    img.alt = product.name;
    img.className = "theme-image-card";

    const name = document.createElement("p");
    name.textContent = product.name;

    card.appendChild(img);
    card.appendChild(name);

    card.onclick = () => showProductDetail(i);
    container.appendChild(card);
  });
}

// Show product detail with theme image and gallery
function showProductDetail(productIndex) {
  currentProduct = currentBatch.products[productIndex];
  document.getElementById("product-list").classList.add("hidden");
  document.getElementById("product-detail").classList.remove("hidden");

  document.getElementById("detailProductName").textContent = currentProduct.name;
  document.getElementById("detailThemeImage").src = currentProduct.themeImage || 'assets/images/default.jpg';

  const container = document.getElementById("detailImagesContainer");
  container.innerHTML = "";
  currentProduct.images.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "theme-image-card";
    img.onclick = () => openFullscreen(src);
    container.appendChild(img);
  });
}

// Fullscreen
function openFullscreen(src) {
  const overlay = document.createElement("div");
  overlay.style = `
    position: fixed; top:0; left:0;
    width:100vw; height:100vh;
    background: rgba(0,0,0,0.9);
    display:flex; justify-content:center; align-items:center;
    z-index:9999;
  `;
  const img = document.createElement("img");
  img.src = src;
  img.style.maxWidth = "90%";
  img.style.maxHeight = "90%";
  img.style.cursor = "zoom-in";
  let scale = 1;
  img.onclick = (e) => {
    scale = scale === 1 ? 2 : 1;
    img.style.transform = `scale(${scale})`;
    img.style.cursor = scale===1?"zoom-in":"zoom-out";
    e.stopPropagation();
  };
  overlay.appendChild(img);
  overlay.onclick = () => document.body.removeChild(overlay);
  document.body.appendChild(overlay);
}

// Back buttons
function backToBatches() {
  currentBatch = null;
  document.getElementById("product-list").classList.add("hidden");
  document.getElementById("batch-list").classList.remove("hidden");
}

function backToProducts() {
  currentProduct = null;
  document.getElementById("product-detail").classList.add("hidden");
  document.getElementById("product-list").classList.remove("hidden");
}

// Init
loadDataAndRender();

