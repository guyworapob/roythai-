/* Shop page: cart + order form (FRONTEND DEMO — no backend, no payment). */
const CONFIG = {
  PRODUCT_ID: 'suki-sauce',
  PRODUCT_NAME: 'น้ำจิ้มสุกี้ ร้อยท้าย',
  PRICE: 59,            // <-- placeholder price: edit here
  CURRENCY: '฿',
  STORAGE_KEY: 'roythai-demo-cart'
};

/* ===== BACKEND HOOK =====
   Replace the body of this function to send the order for real, e.g.
   return fetch('/api/orders', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(order)}).then(r => r.json());
   Until then it only resolves locally and nothing is saved or paid. */
function submitOrder(order) {
  return Promise.resolve({ demo: true, order });
}

(() => {
  const $ = s => document.querySelector(s);
  const money = n => CONFIG.CURRENCY + n.toLocaleString('th-TH');
  let draftQty = 1;
  let cart = {};                                           // { productId: qty }
  try { cart = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || {}; } catch (e) { cart = {}; }
  const save = () => { try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(cart)); } catch (e) {} };
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);

  function render() {
    const qty = cart[CONFIG.PRODUCT_ID] || 0, total = qty * CONFIG.PRICE;
    $('#price').textContent = money(CONFIG.PRICE);
    $('#q-val').textContent = draftQty;
    $('#cart-count').textContent = count();
    $('#cart-total').textContent = money(total);
    $('#f-qty').value = qty; $('#f-total').value = money(total);
    const list = $('#cart-list'); list.innerHTML = '';
    if (!qty) {
      const li = document.createElement('li'); li.className = 'empty';
      li.style.display = 'block'; li.textContent = 'ตะกร้ายังว่างอยู่ เลือกจำนวนด้านบนแล้วกด Add to cart';
      list.append(li); return;
    }
    const li = document.createElement('li');
    li.innerHTML = `<img src="assets/bottle.png" alt=""><div><strong></strong><div>${money(CONFIG.PRICE)} / ขวด</div></div>
      <div class="qty"><button type="button" data-a="dec" aria-label="ลดจำนวน">−</button><output>${qty}</output><button type="button" data-a="inc" aria-label="เพิ่มจำนวน">+</button></div>
      <div class="lt">${money(total)}</div><button type="button" class="rm" data-a="rm">ลบ</button>`;
    li.querySelector('strong').textContent = CONFIG.PRODUCT_NAME;
    list.append(li);
  }
  function setQty(n) { n <= 0 ? delete cart[CONFIG.PRODUCT_ID] : (cart[CONFIG.PRODUCT_ID] = Math.min(n, 99)); save(); render(); }
  const bump = () => window.gsap && RT.motionOK && gsap.fromTo('#cart-count', { scale: 1.8 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,.5)' });

  $('#q-minus').onclick = () => { draftQty = Math.max(1, draftQty - 1); render(); };
  $('#q-plus').onclick = () => { draftQty = Math.min(99, draftQty + 1); render(); };
  $('#add').onclick = () => { setQty((cart[CONFIG.PRODUCT_ID] || 0) + draftQty); bump(); };
  $('#buy').onclick = () => { setQty((cart[CONFIG.PRODUCT_ID] || 0) + draftQty); bump(); RT.scrollTo('#checkout'); };
  $('#cart-list').addEventListener('click', e => {
    const a = e.target.dataset.a, q = cart[CONFIG.PRODUCT_ID] || 0;
    if (a === 'inc') setQty(q + 1); if (a === 'dec') setQty(q - 1); if (a === 'rm') setQty(0);
  });

  /* Order form: validate, then hand off to submitOrder() */
  const notice = $('#notice');
  const say = (msg, err) => { notice.textContent = msg; notice.className = 'notice show' + (err ? ' err' : ''); };
  $('#order-form').addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#f-name').value.trim(), phone = $('#f-phone').value.replace(/[\s-]/g, ''), address = $('#f-address').value.trim();
    if (!count()) return say('ตะกร้ายังว่าง กรุณาเพิ่มสินค้าก่อนยืนยันออเดอร์', true);
    if (!name) return say('กรุณากรอกชื่อผู้สั่งซื้อ', true);
    if (!/^0\d{8,9}$/.test(phone)) return say('กรุณากรอกเบอร์โทรศัพท์ 9–10 หลักที่ขึ้นต้นด้วย 0', true);
    if (!address) return say('กรุณากรอกที่อยู่จัดส่ง', true);
    const order = { name, phone, address, note: $('#f-note').value.trim(), items: [{ id: CONFIG.PRODUCT_ID, name: CONFIG.PRODUCT_NAME, qty: cart[CONFIG.PRODUCT_ID], price: CONFIG.PRICE }], total: cart[CONFIG.PRODUCT_ID] * CONFIG.PRICE };
    const res = await submitOrder(order);
    if (res && res.demo) say(`รับข้อมูลในโหมดเดโมแล้ว (${order.items[0].qty} ขวด รวม ${money(order.total)}) — ยังไม่ได้ส่งออเดอร์และไม่มีการชำระเงินจริง ต้องเชื่อมต่อระบบหลังบ้านใน submitOrder() ก่อน`);
    else say('ส่งออเดอร์เรียบร้อย');
  });

  render();
  if (RT.motionOK) {
    RT.parallax(document.querySelector('.stage'), [{ el: $('.stage .bw'), depth: -30 }, { el: $('.stage .glow.gold'), depth: 70 }]);
    RT.ready.then(() => gsap.from('.stage .bottle', { yPercent: 14, opacity: 0, scale: 0.9, duration: 1.8, ease: 'power4.out' }));
  }
})();
