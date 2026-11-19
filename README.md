# ROY THAI — Premium Interactive Website

ไม่ต้องติดตั้งอะไรเพิ่ม (ไม่มี build step) — ใช้ GSAP, ScrollTrigger, Lenis ผ่าน CDN จึงต้องออนไลน์ตอนเปิดดู

## เปิดใน VS Code
1. File > Open Folder... เลือกโฟลเดอร์ `roythai`
2. ติดตั้งส่วนเสริม **Live Server** (Ritwick Dey) แล้วคลิกขวาที่ `index.html` > *Open with Live Server*
   - หรือใช้ terminal: `python3 -m http.server 5500` แล้วเปิด http://localhost:5500

## โครงสร้าง
- `index.html` หน้าแรก / `shop.html` หน้าสั่งซื้อ
- `css/style.css` สไตล์ทั้งหมด
- `js/common.js` Smooth scroll, page transition, cursor, magnetic, reveal
- `js/home.js` Animation หน้าแรก (hero pin, horizontal scroll)
- `js/shop.js` ตะกร้า + ฟอร์ม (แก้ราคาที่ `CONFIG.PRICE`)
- `assets/bottle.png` รูปขวด (ตัดพื้นหลังขาวออก) / `assets/bottle-original.png` ไฟล์เดิม

## ส่วนที่ต้องต่อระบบหลังบ้าน
`submitOrder()` ใน `js/shop.js` — ตอนนี้เป็นเดโม ไม่บันทึกออเดอร์และไม่รับชำระเงิน
