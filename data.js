// ============================================================
// GADGETS BD - data.js
// Static configurations only. Real data comes from Firebase.
// Default categories, brands, and banners are seeded to Firebase
// on first load. After that, everything is managed from Admin Panel.
// ============================================================

// ===== DEFAULT CATEGORIES (Computer/Electronics related) =====
// These will be seeded to Firebase on first run.
// After that, you can add/edit/delete from Admin Panel > Categories.
const CATEGORIES = [
  { id: 'laptop',      name: 'Laptop',         icon: 'fas fa-laptop',         banner: 'laptop' },
  { id: 'desktop',     name: 'Desktop',        icon: 'fas fa-desktop',        banner: 'desktop' },
  { id: 'monitor',     name: 'Monitor',        icon: 'fas fa-tv',             banner: 'monitor' },
  { id: 'keyboard',    name: 'Keyboard',       icon: 'fas fa-keyboard',       banner: 'keyboard' },
  { id: 'mouse',       name: 'Mouse',          icon: 'fas fa-mouse',          banner: 'mouse' },
  { id: 'ram',         name: 'RAM',            icon: 'fas fa-memory',         banner: 'ram' },
  { id: 'storage',     name: 'Storage',        icon: 'fas fa-hdd',            banner: 'storage' },
  { id: 'gpu',         name: 'Graphics Card',  icon: 'fas fa-gamepad',        banner: 'gpu' },
  { id: 'processor',   name: 'Processor',      icon: 'fas fa-microchip',      banner: 'processor' },
  { id: 'motherboard', name: 'Motherboard',    icon: 'fas fa-server',         banner: 'motherboard' },
  { id: 'cooling',     name: 'Cooling',        icon: 'fas fa-fan',            banner: 'cooling' },
  { id: 'power-supply',name: 'Power Supply',   icon: 'fas fa-plug',           banner: 'power-supply' },
  { id: 'casing',      name: 'Casing',         icon: 'fas fa-cube',           banner: 'casing' },
  { id: 'accessories', name: 'Accessories',    icon: 'fas fa-headphones',     banner: 'accessories' },
  { id: 'gaming',      name: 'Gaming',         icon: 'fas fa-gamepad',        banner: 'gaming' },
  { id: 'networking',  name: 'Networking',     icon: 'fas fa-network-wired',  banner: 'networking' },
  { id: 'cables',      name: 'Cables & Adapters',icon: 'fas fa-usb',          banner: 'cables' },
  { id: 'printer',     name: 'Printer',        icon: 'fas fa-print',          banner: 'printer' },
  { id: 'ups',         name: 'UPS',            icon: 'fas fa-battery-full',   banner: 'ups' },
];

// ===== DEFAULT BRANDS (Electronics brands) =====
// These will be seeded to Firebase on first run.
// After that, you can add/edit/delete from Admin Panel > Brands.
const BRANDS = [
  { id: 'asus',          name: 'ASUS',          logo: '', website: 'asus.com',         visible: true },
  { id: 'msi',           name: 'MSI',           logo: '', website: 'msi.com',          visible: true },
  { id: 'gigabyte',      name: 'Gigabyte',      logo: '', website: 'gigabyte.com',     visible: true },
  { id: 'apple',         name: 'Apple',         logo: '', website: 'apple.com',        visible: true },
  { id: 'dell',          name: 'Dell',          logo: '', website: 'dell.com',         visible: true },
  { id: 'hp',            name: 'HP',            logo: '', website: 'hp.com',           visible: true },
  { id: 'lenovo',        name: 'Lenovo',        logo: '', website: 'lenovo.com',       visible: true },
  { id: 'acer',          name: 'Acer',          logo: '', website: 'acer.com',         visible: true },
  { id: 'samsung',       name: 'Samsung',       logo: '', website: 'samsung.com',      visible: true },
  { id: 'lg',            name: 'LG',            logo: '', website: 'lg.com',           visible: true },
  { id: 'corsair',       name: 'Corsair',       logo: '', website: 'corsair.com',      visible: true },
  { id: 'logitech',      name: 'Logitech',      logo: '', website: 'logitech.com',     visible: true },
  { id: 'razer',         name: 'Razer',         logo: '', website: 'razer.com',        visible: true },
  { id: 'intel',         name: 'Intel',         logo: '', website: 'intel.com',        visible: true },
  { id: 'amd',           name: 'AMD',           logo: '', website: 'amd.com',          visible: true },
  { id: 'nvidia',        name: 'NVIDIA',        logo: '', website: 'nvidia.com',       visible: true },
  { id: 'kingston',      name: 'Kingston',      logo: '', website: 'kingston.com',     visible: true },
  { id: 'wd',            name: 'Western Digital',logo: '', website: 'wd.com',          visible: true },
  { id: 'seagate',       name: 'Seagate',       logo: '', website: 'seagate.com',      visible: true },
  { id: 'cooler-master', name: 'Cooler Master', logo: '', website: 'coolermaster.com', visible: true },
  { id: 'nzxt',          name: 'NZXT',          logo: '', website: 'nzxt.com',         visible: true },
  { id: 'steelseries',   name: 'SteelSeries',   logo: '', website: 'steelseries.com',  visible: true },
  { id: 'hyperx',        name: 'HyperX',        logo: '', website: 'hyperx.com',       visible: true },
  { id: 'benq',          name: 'BenQ',          logo: '', website: 'benq.com',         visible: true },
  { id: 'viewsonic',     name: 'ViewSonic',     logo: '', website: 'viewsonic.com',    visible: true },
  { id: 'tp-link',       name: 'TP-Link',       logo: '', website: 'tp-link.com',      visible: true },
  { id: 'netgear',       name: 'Netgear',       logo: '', website: 'netgear.com',      visible: true },
  { id: 'canon',         name: 'Canon',         logo: '', website: 'canon.com',        visible: true },
  { id: 'epson',         name: 'Epson',         logo: '', website: 'epson.com',        visible: true },
  { id: 'apc',           name: 'APC',           logo: '', website: 'apc.com',          visible: true },
];

// ===== DEFAULT BANNERS (Hero Slider - 3 slides) =====
// These will be seeded to Firebase on first run.
// To change banner images: Admin Panel > Banners, or edit image URLs here.
// The entire hero background changes when you change the image.
const BANNERS = [
  {
    id: 'banner-1',
    title: 'Premium Laptops & Desktops',
    subtitle: 'Shop the latest tech at unbeatable prices. Genuine warranty on all products.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1600&h=600&fit=crop',
    link: '#products',
    btnText: 'Shop Now',
    active: true,
  },
  {
    id: 'banner-2',
    title: 'Gaming Gear Collection',
    subtitle: 'Level up your gaming experience with top-tier gaming hardware.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&h=600&fit=crop',
    link: '#products?category=gaming',
    btnText: 'Shop Now',
    active: true,
  },
  {
    id: 'banner-3',
    title: 'Accessories & More',
    subtitle: 'Everything you need for your perfect setup. Keyboards, mice, monitors & more.',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1600&h=600&fit=crop',
    link: '#products?category=accessories',
    btnText: 'Shop Now',
    active: true,
  },
];

const PRODUCTS = [];   // Firebase থেকে আসবে

const BLOGS = [];
const REVIEWS = [];
const OFFERS = [];

// এগুলো স্ট্যাটিক রাখা যেতে পারে, অথবা পরে ডাটাবেসে রাখতে পারেন
const SERVICE_HIGHLIGHTS = [
  { icon: 'fas fa-truck', title: 'Fast Delivery', desc: 'Same day in Dhaka, 2-3 days nationwide' },
  { icon: 'fas fa-shield-alt', title: 'Genuine Products', desc: '100% authentic with warranty' },
  { icon: 'fas fa-undo', title: 'Easy Returns', desc: '7-day return policy' },
  { icon: 'fas fa-headset', title: '24/7 Support', desc: 'Dedicated customer service' },
];

// Export for use in app.js
if (typeof window !== 'undefined') {
  window.GBD_DATA = { CATEGORIES, BRANDS, PRODUCTS, BANNERS, BLOGS, REVIEWS, OFFERS, SERVICE_HIGHLIGHTS };
}
