// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyALTuDEFOFs-am2LU4OS5HJOQPwEHys-K8",
  authDomain: "paridhi-art-jewellery-149b9.firebaseapp.com",
  projectId: "paridhi-art-jewellery-149b9",
  storageBucket: "paridhi-art-jewellery-149b9.appspot.com",
  messagingSenderId: "249109069877",
  appId: "1:249109069877:web:5b18291ddd0e4830a0317c"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const CLOUDINARY_CLOUD_NAME = "dmnddgono";
const CLOUDINARY_UPLOAD_PRESET = "paridhi_upload";

let batches = [];
let selectedBatchIndex = null;
let selectedProductIndex = null;

// ------------------- Admin Login -------------------
async function checkAdminLogin() {
  try {
    if (!auth.currentUser) {
      const email = prompt("Enter admin email:");
      const password = prompt("Enter password:");
      await auth.signInWithEmailAndPassword(email, password);
    }
    await loadData();
    console.log("Admin logged in.");
  } catch (e) {
    alert("Login failed: " + e.message);
    window.location.href = "index.html";
  }
}

// ------------------- Load & Save Data -------------------
async function loadData() {
  const doc = await db.collection("websiteData").doc("batches").get();
  batches = doc.exists ? doc.data().batches : [];
  renderBatches();
}

async function saveData() {
  await db.collection("websiteData").doc("batches").set({ batches });
}

// ------------------- Batches -------------------
function addBatch() {
  const name = document.getElementById("newBatchName").value.trim();
  if (!name) return;
  batches.push({ name, products: [] });
  saveData(); renderBatches();
  document.getElementById("newBatchName").value = "";
}

function renderBatches() {
  const list = document.getElementById("batchList");
  list.innerHTML = "";
  batches.forEach((b, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span onclick="selectBatch(${i})">${b.name}</span>
      <button onclick="renameBatch(${i})">✏️</button>
      <button onclick="deleteBatch(${i})">🗑️</button>
    `;
    list.appendChild(li);
  });
}

function renameBatch(i) {
  const newName = prompt("Enter new batch name:", batches[i].name);
  if (newName) { batches[i].name = newName; saveData(); renderBatches(); }
}

function deleteBatch(i) {
  if (confirm(`Delete batch "${batches[i].name}"?`)) {
    batches.splice(i, 1); saveData(); renderBatches(); document.getElementById("productSection").classList.add("hidden");
  }
}

// ------------------- Products -------------------
function selectBatch(i) {
  selectedBatchIndex = i;
  document.getElementById("selectedBatchName").textContent = batches[i].name;
  document.getElementById("productSection").classList.remove("hidden");
  renderProducts();
}

function addProduct() {
  const name = document.getElementById("newProductName").value.trim();
  if (!name || selectedBatchIndex === null) return;
  batches[selectedBatchIndex].products.push({ name, images: [], themeImage: null });
  saveData(); renderProducts(); document.getElementById("newProductName").value = "";
}

function renderProducts() {
  const list = document.getElementById("productList");
  list.innerHTML = "";
  const products = batches[selectedBatchIndex].products;
  products.forEach((p,i)=>{
    const li = document.createElement("li");
    const imgSrc = p.themeImage || "assets/images/default.jpg";
    li.innerHTML = `
      <img src="${imgSrc}" width="80" style="vertical-align:middle; margin-right:6px;" />
      <span onclick="selectProduct(${i})" style="cursor:pointer;">${p.name}</span>
      <button onclick="renameProduct(${i})">✏️</button>
      <button onclick="deleteProduct(${i})">🗑️</button>
    `;
    list.appendChild(li);
  });
}

function renameProduct(i) { 
  const newName = prompt("New product name:", batches[selectedBatchIndex].products[i].name);
  if(newName){ batches[selectedBatchIndex].products[i].name=newName; saveData(); renderProducts();}
}

function deleteProduct(i) {
  if(confirm("Delete this product?")){
    batches[selectedBatchIndex].products.splice(i,1);
    saveData(); renderProducts();
  }
}

function selectProduct(i) {
  selectedProductIndex=i;
  document.getElementById("selectedProductName").textContent = batches[selectedBatchIndex].products[i].name;
  renderImageList();
}

// ------------------- Images -------------------
async function uploadImages() {
  const files = document.getElementById("imageUpload").files;
  if(!files.length) { alert("Select images"); return; }
  const product = batches[selectedBatchIndex].products[selectedProductIndex];

  for(const file of files){
    if(!file.type.startsWith("image/")) continue;
    const url = await uploadToCloudinary(file);
    product.images.push(url);
  }
  saveData(); renderImageList();
}

async function uploadToCloudinary(file){
  const fd=new FormData();
  fd.append("file",file);
  fd.append("upload_preset",CLOUDINARY_UPLOAD_PRESET);
  const res=await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,{method:"POST",body:fd});
  const data=await res.json();
  return data.secure_url;
}

function renderImageList() {
  const container=document.getElementById("imageList");
  container.innerHTML="";
  const product=batches[selectedBatchIndex].products[selectedProductIndex];
  product.images.forEach((src,i)=>{
    const div=document.createElement("div");
    div.className="product-card";

    const img=document.createElement("img");
    img.src=src;
    img.className="theme-image-card";

    const setBtn=document.createElement("button");
    setBtn.textContent="Set as Theme";
    setBtn.onclick=()=>{ product.themeImage=src; saveData(); renderProducts(); renderImageList(); };

    const delBtn=document.createElement("button");
    delBtn.textContent="🗑️";
    delBtn.onclick=()=>{ product.images.splice(i,1); if(product.themeImage===src) product.themeImage=null; saveData(); renderProducts(); renderImageList(); };

    div.appendChild(img);
    div.appendChild(setBtn);
    div.appendChild(delBtn);
    container.appendChild(div);
  });
}

// ------------------- Share Link -------------------
function copyShareLink() {
  const link=window.location.origin+"/index.html";
  navigator.clipboard.writeText(link).then(()=>{
    document.getElementById("shareStatus").textContent="Link copied! Share with family.";
  }).catch(()=>{ document.getElementById("shareStatus").textContent="Failed to copy."; });
}

// ------------------- Initialize -------------------
checkAdminLogin();
