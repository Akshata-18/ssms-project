 /* --- DATA & STATE --- */
    let products = JSON.parse(localStorage.getItem('om_prods')) || [
        {id: 1, name: "Luxury Journal", cat: "Stationery", price: 450, stock: 20, img: "https://m.media-amazon.com/images/I/71KAt0n9u5L.jpg"},
        {id: 2, name: "Matte Black Pen", cat: "Writing", price: 60, stock: 50, img: "https://m.media-amazon.com/images/I/51uU8vI9M3L.jpg"}
    ];
    let registeredUsers = JSON.parse(localStorage.getItem('om_users')) || [];
    let activeUser = JSON.parse(localStorage.getItem('om_session')) || null;
    let orders = JSON.parse(localStorage.getItem('om_orders')) || [];
    let sales = JSON.parse(localStorage.getItem('om_sales')) || [];
    let cart = JSON.parse(localStorage.getItem("om_cart")) || [];
    let isLoginMode = false;
    let activeBillIndex = null;
    /* --- NAVIGATION --- */
    function show(id) {
        if(id === 'adminDash' && !sessionStorage.getItem('admAuth')) return show('adminLogin');
        
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        
        if(id === 'home') renderHome();
        if(id === 'shop') renderShop();
        if(id === 'cart') renderCart();
       if(id === 'adminDash'){
       switchTab('inventory');
       renderInventory();
      }
        window.scrollTo(0,0);
        updateUI();
    }

   function updateUI(){

const greet = document.getElementById("userGreeting");

greet.innerHTML = activeUser
? `Hi, ${activeUser.name}
<span style="cursor:pointer;color:red;margin-left:8px"
onclick="userLogout()">Logout</span>`
: "";

localStorage.setItem("om_cart", JSON.stringify(cart));

document.getElementById("cartCount").innerText =
cart.reduce((t,i)=>t+(i.qty||1),0);

}
    /* --- AUTHENTICATION LOGIC --- */
    function toggleAuthMode(){

    isLoginMode = !isLoginMode;

    document.getElementById('authTitle').innerText =
        isLoginMode ? "Login Account" : "Register Account";

    document.getElementById('authBtn').innerText =
        isLoginMode ? "Login" : "Create Account";

    document.getElementById('regFields').style.display =
        isLoginMode ? "none" : "block";

    document.getElementById('toggleText').innerHTML =
        isLoginMode
        ? "Need an account? <span>Register</span>"
        : "Already have an account? <span>Login</span>";

}
    function handleUserAuth() {
        const email = document.getElementById('uEmail').value;
        const pass = document.getElementById('uPass').value;
if(!/^\S+@\S+\.\S+$/.test(email)){
alert("Enter valid email");
return;
}
        if(isLoginMode){

    const user = registeredUsers.find(
        u => u.email === email && u.pass === pass
    );

    if(user){

    activeUser = user;

    localStorage.setItem("om_session", JSON.stringify(activeUser));

    alert("Login successful");

    updateUI();

    show("shop");

}else{
        alert("Invalid Email or Password");
    }

}
        else {
            const name = document.getElementById('uName').value;
            if(!name || !email || !pass) return alert("Fill all fields");
            const newUser = { name, email, pass };
            registeredUsers.push(newUser);
            localStorage.setItem('om_users', JSON.stringify(registeredUsers));
            alert("Registration Successful! Please login.");
            toggleAuthMode();
        }
        
    }
   function userLogout(){

activeUser = null;

localStorage.removeItem("om_session");

cart = [];

document.getElementById("uName").value = "";
document.getElementById("uEmail").value = "";
document.getElementById("uPass").value = "";

isLoginMode = false;

document.getElementById("authTitle").innerText = "Register Account";
document.getElementById("authBtn").innerText = "Create Account";
document.getElementById("regFields").style.display = "block";
document.getElementById("toggleText").innerHTML =
"Already have an account? <span>Login</span>";

updateUI();

alert("Logged out");
show("home");

}

    function handleAdminLogin(){

const user = document.getElementById("admUser").value.trim();
const pass = document.getElementById("admPass").value.trim();

if(user === "admin" && pass === "123"){

sessionStorage.setItem("admAuth","true");

alert("Admin Login Successful");

show("adminDash");

}
else{
alert("Invalid Admin Credentials");
}

}
    function adminLogout() { sessionStorage.removeItem('admAuth'); show('home'); }

    /* --- STORE LOGIC --- */
    function renderHome() {
        const cats = [...new Set(products.map(p => p.cat))];
        document.getElementById('categoryGrid').innerHTML = cats.map(c => `
            <div class="card" onclick="show('shop'); renderShop('${c}')" style="cursor:pointer; text-align:center">
                <h3>${c}</h3>
                <p style="color:var(--primary); font-weight:700">Explore →</p>
            </div>
        `).join("");
    }

/* --- MODAL LOGIC --- */
function openProduct(id) {
    const p = products.find(prod => prod.id === id);
    if(!p) return;

    document.getElementById('modalName').innerText = p.name;
    document.getElementById('modalCat').innerText = p.cat;
    document.getElementById('modalPrice').innerText = `₹${p.price}`;
    document.getElementById('modalImg').src = p.img;
    
    // Update the button inside the modal to work for this specific ID
    document.getElementById('modalAddBtn').onclick = () => {
        addToCart(p.id);
        closeModal();
    };

    document.getElementById('productModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

    function renderShop(filter = "") {
    const term = document.getElementById('shopSearch').value.toLowerCase();
    let list = filter ? products.filter(p => p.cat === filter) : products;
    if(term) list = list.filter(p => p.name.toLowerCase().includes(term));

    document.getElementById('shopGrid').innerHTML = list.map(p => `
        <div class="card">
            <img src="${p.img}" class="prod-img" onclick="openProduct(${p.id})" style="cursor:pointer">
            <h4>${p.name}</h4>
            <p style="color:#64748b; font-size:0.9rem; margin-bottom:10px;">${p.cat} • ₹${p.price}</p>
            <div style="display:flex; gap:10px;">
                <button class="btn btn-outline" onclick="openProduct(${p.id})" style="margin:0; flex:1">View</button>
                <button class="btn btn-p" onclick="addToCart(${p.id})" style="margin:0; flex:2">Add</button>
            </div>
        </div>
    `).join("");
}

  function addToCart(id){

if(!activeUser){
alert("Please login first");
show("userAuth");
return;
}

const prod = products.find(p=>p.id===id);
if(!prod) return;

const item = cart.find(c=>c.id===id);

if(item){

if(item.qty >= prod.stock){
alert("No more stock available");
return;
}

item.qty++;

}else{

if(prod.stock <= 0){
alert("Out of stock");
return;
}

cart.push({
id:prod.id,
name:prod.name,
price:prod.price,
img:prod.img,
qty:1
});

}

updateUI();
renderCart();
}

   function renderCart(){

    const list = document.getElementById("cartItems");

    if(cart.length === 0){
        list.innerHTML = "Your bag is empty";
        document.getElementById("cartTotal").innerText = "₹0";
        return;
    }

    let total = 0;

    list.innerHTML = cart.map((item,i)=>{

        

        const subtotal = item.price * item.qty;
total += subtotal;

        return `
        <div style="display:flex;justify-content:space-between;
        align-items:center;padding:10px;border-bottom:1px solid #eee">

        <div style="display:flex;align-items:center;gap:10px">
            <img src="${item.img}" width="50">
            <div>
                <b>${item.name}</b><br>
                ₹${item.price}
            </div>
        </div>

        <div style="display:flex;align-items:center;gap:8px">

            <button onclick="changeQty(${i},-1)">-</button>

            <b>${item.qty}</b>

            <button onclick="changeQty(${i},1)">+</button>

            <span style="margin-left:10px;font-weight:700">
            ₹${subtotal}
            </span>

            <button onclick="removeCart(${i})"
            style="border:none;background:none;color:red">✖</button>

        </div>

        </div>
        `;

    }).join("");

    document.getElementById("cartTotal").innerText = "₹"+total;
}

function showUserOrders(){

if(!activeUser){
alert("Please login first");
show("userAuth");
return;
}

show("orderHistory");

const box = document.getElementById("userOrders");

const userOrders = [...orders,...sales]
.filter(o => o.customer === activeUser.name);

if(userOrders.length === 0){
box.innerHTML = "No orders yet";
return;
}

box.innerHTML = userOrders.map(o=>{

let items = o.items.map(i =>
`${i.name} x${i.qty}`
).join("<br>");

return `

<div class="card" style="margin-bottom:15px">

<h4>Order #${o.id}</h4>

<p><b>Date:</b> ${o.date}</p>

<p><b>Status:</b> ${o.status}</p>

<p><b>Items:</b><br>${items}</p>

<p style="font-weight:700">Total : ₹${o.total}</p>

</div>

`;

}).join("");

}
function removeCart(index){
    cart.splice(index,1);
    renderCart();
    updateUI();
}

   function processOrder(){

    if(cart.length === 0){
        alert("Cart empty");
        return;
    }

    const address = document.getElementById('shipAddr').value;
    const phone = document.getElementById('shipMob').value.trim();
     
    if(!/^[0-9]{10}$/.test(phone)){
    alert("Enter valid 10 digit phone number");
    return;
    }
    if(!address || !phone){
        alert("Please enter address and phone");
        return;
    }

    const order = {
        id: Date.now(),
        customer: activeUser.name,
        address: address,
        phone: phone,
        items: JSON.parse(JSON.stringify(cart)),
        total: cart.reduce((a,b)=>a+(b.price*(b.qty||1)),0),
        status: "Pending",
        date: new Date().toLocaleString()
    };


    // Reduce stock
    cart.forEach(c => {

        const prod = products.find(p => p.id === c.id);

        if(prod){
            prod.stock -= (c.qty || 1);
        }

    });

    // Save updated stock
    localStorage.setItem("om_prods", JSON.stringify(products));

    // Save order
    orders.push(order);
    localStorage.setItem('om_orders', JSON.stringify(orders));

    // Clear cart
    cart = [];

    renderCart();
    updateUI();

    alert("Order placed successfully!");

    show('home');

   }
function changeQty(index, delta){

    const item = cart[index];
    const prod = products.find(p => p.id === item.id);

    if(!prod) return;

    const newQty = item.qty + delta;

    if(newQty <= 0){
        cart.splice(index,1);
    }
    else if(newQty > prod.stock){
        alert("Stock limit reached");
        return;
    }
    else{
        item.qty = newQty;
    }

    renderCart();
    updateUI();
}
    /* --- ADMIN DASHBOARD --- */
   function switchTab(tab){

// hide all tabs
document.getElementById("tabInventory").style.display = "none";
document.getElementById("tabOrders").style.display = "none";
document.getElementById("tabSales").style.display = "none";

// remove active button
document.querySelectorAll(".side-btn")
.forEach(btn=>btn.classList.remove("active-tab"));

if(tab === "inventory"){
document.getElementById("tabInventory").style.display = "block";
renderInventory();
}

if(tab === "orders"){
document.getElementById("tabOrders").style.display = "block";
renderAdminOrders();
}

if(tab === "sales"){
document.getElementById("tabSales").style.display = "block";

setTimeout(()=>{
renderSalesReport();
},50);

}

// highlight selected button
document.querySelectorAll(".side-btn").forEach(btn=>{
if(btn.innerText.toLowerCase().includes(tab))
btn.classList.add("active-tab");
});

}

    function saveNewProduct(){

    const name = document.getElementById('niName').value;
    const cat = document.getElementById('niCat').value;
    const price = Number(document.getElementById('niPrice').value);
    const stock = Number(document.getElementById('niStock').value);
    const img = document.getElementById('niImg').value || "https://placehold.co/200";

    if(!name || !cat || !price || !stock){
        alert("Fill all fields");
        return;
    }

    const p = {
        id: Date.now(),
        name,
        cat,
        price,
        stock,
        img
    };

    products.push(p);

    localStorage.setItem('om_prods', JSON.stringify(products));

    renderInventory();

    toggleAddForm();
}

   function renderInventory(){

document.getElementById('inventoryTable').innerHTML = `
<table style="width:100%;border-collapse:collapse">

<tr style="background:#f1f5f9">
<th style="padding:10px">Product</th>
<th>Price</th>
<th>Stock</th>
<th>Action</th>
</tr>

${products.map(p=>{

let stockColor = "green";
let warning = "";

if(p.stock <= 5){
stockColor = "red";
warning = "⚠ Low Stock";
}

return `
<tr>
<td style="padding:10px">${p.name}</td>

<td>₹${p.price}</td>

<td style="color:${stockColor};font-weight:700">
${p.stock} ${warning}
</td>

<td>

<button onclick="editProduct(${p.id})">
Edit
</button>

<button onclick="delP(${p.id})"
style="color:red;border:none;background:none">
Delete
</button>

</td>
</tr>
`;

}).join("")}

</table>
`;
}

    function renderAdminOrders(){

    const stream = document.getElementById('orderList');

    if(orders.length === 0){
        stream.innerHTML = "No pending orders.";
        return;
    }

    stream.innerHTML = orders.map((o,idx)=>{

        let items = o.items.map(i =>
            `${i.name} x${i.qty} (₹${i.price*i.qty})`
        ).join("<br>");

        return `
        <div class="card" style="margin-bottom:15px;background:#f8fafc">

        <h4>Order #${o.id}</h4>

        <p><b>Customer :</b> ${o.customer}</p>

        <p><b>Mobile :</b> ${o.phone}</p>

        <p><b>Address :</b> ${o.address}</p>

        <p><b>Date :</b> ${o.date}</p>

        <p><b>Items :</b><br>${items}</p>

        <p style="font-size:1.2rem"><b>Total :</b> ₹${o.total}</p>

        <p>Status : <b style="color:orange">${o.status}</b></p>

        <div style="display:flex;gap:10px;margin-top:10px">

        <button class="btn btn-p"
        onclick="generateBill(${idx})">
        Deliver
        </button>

        <button class="btn btn-outline"
        onclick="cancelOrder(${idx})">
        Cancel
        </button>

        </div>

        </div>
        `;

    }).join("");
}
function generateBill(index){

const order = orders[index];

activeBillIndex = index;

show("billPage");

document.getElementById("billHeader").innerHTML = `
<div>
<b>${order.customer}</b><br>
${order.phone}<br>
${order.address}
</div>

<div>
Order ID : ${order.id}<br>
${new Date().toLocaleDateString()}
</div>
`;

document.getElementById("billItemsBody").innerHTML =
order.items.map(i => `
<tr>
<td style="padding:8px;border:1px solid #ddd">${i.name}</td>
<td style="border:1px solid #ddd;text-align:center">${i.qty}</td>
<td style="border:1px solid #ddd;text-align:center">₹${i.price}</td>
<td style="border:1px solid #ddd;text-align:center">₹${i.price*i.qty}</td>
</tr>
`).join("");

document.getElementById("billTotal").innerText =
"Grand Total : ₹"+order.total;

}

function finalizeSale(){

if(activeBillIndex === null) return;

const order = orders[activeBillIndex];

order.status = "Delivered";

// move order to sales
sales.push(order);

// remove from pending orders
orders.splice(activeBillIndex,1);

// save
localStorage.setItem("om_sales", JSON.stringify(sales));
localStorage.setItem("om_orders", JSON.stringify(orders));

activeBillIndex = null;

alert("Payment confirmed. Sale recorded.");

// force refresh
renderSalesReport();

show("adminDash");
switchTab("sales");

}
function cancelOrder(idx){

const order = orders[idx];

order.items.forEach(i=>{
    const prod = products.find(p=>p.id===i.id);
    if(prod){
        prod.stock += i.qty;
    }
});

orders[idx].status = "Cancelled";
orders.splice(idx,1);
localStorage.setItem("om_orders", JSON.stringify(orders));
renderAdminOrders();

localStorage.setItem("om_orders", JSON.stringify(orders));
localStorage.setItem("om_prods", JSON.stringify(products));

alert("Order Cancelled");

renderAdminOrders();
}
function renderSalesReport(){

const box = document.getElementById("salesReport");

if(!box) return;

if(!sales || sales.length === 0){
box.innerHTML = "<h3>No completed sales yet</h3>";
return;
}

const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);

let html = `

<div style="margin-bottom:25px;padding:20px;background:#eef2ff;border-radius:12px">
<h2>Total Revenue : ₹${totalRevenue}</h2>
<p>Total Orders : ${sales.length}</p>
</div>

<table style="width:100%;border-collapse:collapse">

<tr style="background:#f1f5f9">
<th style="padding:10px;border:1px solid #ddd">Order ID</th>
<th style="border:1px solid #ddd">Customer</th>
<th style="border:1px solid #ddd">Mobile</th>
<th style="border:1px solid #ddd">Products</th>
<th style="border:1px solid #ddd">Total</th>
<th style="border:1px solid #ddd">Date</th>
<th style="border:1px solid #ddd">Status</th>
</tr>
`;

sales.forEach(s => {

const items = (s.items || []).map(i =>
`${i.name} (x${i.qty}) - ₹${i.price * i.qty}`
).join("<br>");

html += `
<tr>

<td style="padding:10px;border:1px solid #ddd">${s.id}</td>

<td style="border:1px solid #ddd">${s.customer || ""}</td>

<td style="border:1px solid #ddd">${s.phone || ""}</td>

<td style="border:1px solid #ddd">${items}</td>

<td style="border:1px solid #ddd;font-weight:700;color:green">
₹${s.total || 0}
</td>

<td style="border:1px solid #ddd">${s.date || ""}</td>

<td style="border:1px solid #ddd;color:green;font-weight:700">
Completed
</td>

</tr>
`;

});

html += "</table>";

box.innerHTML = html;

}

function renderSalesReport(){

const box = document.getElementById("salesReport");

if(!box) return;

if(!sales || sales.length === 0){
box.innerHTML = "<h3>No completed sales yet</h3>";
return;
}

const totalRevenue = sales.reduce((sum,s)=>sum+(s.total||0),0);

let html = `

<div class="sales-summary">
<h2>Total Revenue : ₹${totalRevenue}</h2>
<p>Total Orders : ${sales.length}</p>
</div>

<div class="sales-table-wrapper">

<table class="sales-table">

<thead>

<tr>
<th>Order ID</th>
<th>Customer</th>
<th>Mobile</th>
<th>Products</th>
<th>Total</th>
<th>Date</th>
<th>Status</th>
</tr>

</thead>

<tbody>
`;

sales.forEach(s=>{

const items = (s.items || []).map(i=>
`${i.name} (x${i.qty})`
).join("<br>");

html += `

<tr>

<td>#${s.id}</td>

<td>${s.customer || ""}</td>

<td>${s.phone || ""}</td>

<td class="products">${items}</td>

<td class="price">₹${s.total || 0}</td>

<td>${s.date || ""}</td>

<td><span class="status">Completed</span></td>

</tr>

`;

});

html += `
</tbody>
</table>
</div>
`;

box.innerHTML = html;

}

function renderLowStock(){

const low = products.filter(p => p.stock <= 5);

if(low.length === 0){
return "<p style='color:green;font-weight:700'>All products stock healthy</p>";
}

return `
<div style="margin-bottom:25px;background:#fff3cd;padding:20px;border-radius:12px">

<h3 style="margin-bottom:10px">⚠ Low Stock Alert</h3>

<table style="width:100%;border-collapse:collapse">

<tr style="background:#ffeeba">
<th style="padding:8px">Product</th>
<th>Stock</th>
</tr>

${low.map(p=>`

<tr>

<td style="padding:8px">${p.name}</td>

<td style="color:red;font-weight:700">
${p.stock}
</td>

</tr>

`).join("")}

</table>

</div>
`;

}
    
    function toggleAddForm() { const f = document.getElementById('addForm'); f.style.display = f.style.display === 'none' ? 'block' : 'none'; }
    function delP(id) { products = products.filter(p => p.id !== id); localStorage.setItem('om_prods', JSON.stringify(products)); renderInventory(); }

  window.onload = () => {

    updateUI();

    if(sessionStorage.getItem("admAuth")){
        show("adminDash");
    } else {
        show("home");
    }

};

function editProduct(id){

const p = products.find(x => x.id === id);

const name = prompt("Product Name", p.name);
const cat = prompt("Category", p.cat);   // ✅ added
const price = prompt("Price", p.price);
const stock = prompt("Stock Quantity", p.stock);

if(name !== null) p.name = name;
if(cat !== null) p.cat = cat;   // ✅ added
if(price !== null) p.price = Number(price);
if(stock !== null) p.stock = Number(stock);

localStorage.setItem("om_prods", JSON.stringify(products));

renderInventory();
renderHome();   // ✅ refresh category section
renderShop();   // ✅ refresh shop view

alert("Product Updated");

}