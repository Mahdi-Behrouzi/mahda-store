// بارگذاری اولیه محصولات از فایل JSON (محلی)
let PRODUCTS = [];
fetch('products.json').then(r=>r.json()).then(data=>{
  PRODUCTS = data;
  initCategories();
  renderProducts();
});

// وضعیت برنامه
let cart = JSON.parse(localStorage.getItem('mahdaCart')) || [];
let currentUser = JSON.parse(localStorage.getItem('mahdaUser')) || null;

// المنت‌ها
const catalog = document.getElementById('catalog');
const searchInput = document.getElementById('search');
const cartPanel = document.getElementById('cart-panel');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const btnCartToggle = document.getElementById('btn-cart-toggle');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const btnAdmin = document.getElementById('btn-admin');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart');
const categoryFilter = document.getElementById('category-filter');
const maxPrice = document.getElementById('max-price');
const applyFilters = document.getElementById('apply-filters');

// رویدادها
searchInput.addEventListener('input', ()=> renderProducts(searchInput.value));
btnCartToggle.addEventListener('click', ()=> cartPanel.classList.toggle('hidden'));
btnLogin.addEventListener('click', ()=> location.href='login.html');
btnRegister.addEventListener('click', ()=> location.href='register.html');
btnAdmin.addEventListener('click', ()=> location.href='admin.html');
checkoutBtn.addEventListener('click', handleCheckout);
clearCartBtn.addEventListener('click', ()=> { cart=[]; saveCart(); renderCart(); });
applyFilters.addEventListener('click', ()=> renderProducts(searchInput.value));

// رندر محصولات
function renderProducts(filter=''){
  const maxP = Number(maxPrice.value) || Infinity;
  catalog.innerHTML = '';
  PRODUCTS
    .filter(p=> (filter ? p.name.includes(filter) : true))
    .filter(p=> p.price <= maxP)
    .filter(p=> categoryFilter.value === 'all' ? true : p.category === categoryFilter.value)
    .forEach(p=>{
      const el = document.createElement('article');
      el.className='product';
      el.innerHTML = `
        <img src="${p.image || 'https://via.placeholder.com/400x200?text=Product'}" alt="${p.name}" />
        <h4>${p.name}</h4>
        <p class="price">${p.price.toLocaleString()} تومان</p>
        <p class="badge">دسته: ${p.category}</p>
        <div class="product-controls">
          <button onclick="addToCart(${p.id})">افزودن به سبد</button>
          <button class="secondary" onclick="viewDetails(${p.id})">جزئیات</button>
        </div>
      `;
      catalog.appendChild(el);
    });
}

// دسته‌ها
function initCategories(){
  const cats = ['all', ...new Set(PRODUCTS.map(p=>p.category))];
  categoryFilter.innerHTML = cats.map(c=>`<option value="${c}">${c==='all' ? 'همه' : c}</option>`).join('');
}

// سبد خرید
function addToCart(id){
  const prod = PRODUCTS.find(p=>p.id===id);
  if(!prod) return;
  const entry = cart.find(i=>i.id===id);
  if(entry) entry.qty++;
  else cart.push({id:prod.id,name:prod.name,price:prod.price,qty:1});
  saveCart();
  renderCart();
}
function removeFromCart(id){
  cart = cart.filter(i=>i.id!==id);
  saveCart();
  renderCart();
}
function changeQty(id,delta){
  const it = cart.find(i=>i.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty<=0) removeFromCart(id);
  saveCart(); renderCart();
}
function renderCart(){
  cartList.innerHTML = '';
  let total = 0;
  cart.forEach(i=>{
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${i.name} (${i.qty})</span>
      <div>
        <span>${(i.price*i.qty).toLocaleString()} تومان</span>
        <button onclick="changeQty(${i.id},1)">+</button>
        <button onclick="changeQty(${i.id},-1)">-</button>
        <button onclick="removeFromCart(${i.id})" style="background:${'#d64550'}">حذف</button>
      </div>
    `;
    cartList.appendChild(li);
    total += i.price*i.qty;
  });
  cartTotal.textContent = 'مجموع: ' + total.toLocaleString() + ' تومان';
  cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
}
function saveCart(){ localStorage.setItem('mahdaCart', JSON.stringify(cart)); }

// جزئیات محصول
function viewDetails(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return alert('محصول یافت نشد');
  alert(`${p.name}\nقیمت: ${p.price.toLocaleString()} تومان\nدسته: ${p.category}\nتوضیحات:\n${p.description || 'ندارد'}`);
}

// پرداخت (شبیه‌سازی)
function handleCheckout(){
  if(!currentUser){ if(confirm('برای پرداخت باید وارد شوید. رفتن به صفحه‌ی ورود؟')) location.href='login.html'; return; }
  if(cart.length===0){ alert('سبد خرید خالی است'); return; }
  // ساخت سفارش موقت و هدایت به صفحه پرداخت محلی
  const order = {
    id: 'ORD'+Date.now(),
    user: currentUser.username,
    items: cart,
    total: cart.reduce((s,i)=>s+i.price*i.qty,0),
    date: new Date().toISOString()
  };
  localStorage.setItem('mahdaLastOrder', JSON.stringify(order));
  location.href = 'payment.html';
}

// بارگذاری اولیه
renderCart();
