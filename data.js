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
  { id: 'asus',          name: 'ASUS',          logo: '<img src="https://www.citypng.com/photo/25893/asus-black-logo-free-png" alt="ASUS" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'asus.com',         visible: true },
  { id: 'msi',           name: 'MSI',           logo: '<img src="https://www.pngwing.com/en/free-png-avhds" alt="MSI" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'msi.com',          visible: true },
  { id: 'gigabyte',      name: 'Gigabyte',      logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Gigabyte_Technology_logo.svg/200px-Gigabyte_Technology_logo.svg.png" alt="Gigabyte" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'gigabyte.com',     visible: true },
  { id: 'apple',         name: 'Apple',         logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png" alt="Apple" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'apple.com',        visible: true },
  { id: 'dell',          name: 'Dell',          logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dell_logo_2016.svg/200px-Dell_logo_2016.svg.png" alt="Dell" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'dell.com',         visible: true },
  { id: 'hp',            name: 'HP',            logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/HP_Logo.svg/200px-HP_Logo.svg.png" alt="HP" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'hp.com',           visible: true },
  { id: 'lenovo',        name: 'Lenovo',        logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Lenovo_logo_2024.svg/200px-Lenovo_logo_2024.svg.png" alt="Lenovo" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'lenovo.com',       visible: true },
  { id: 'acer',          name: 'Acer',          logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Acer_Logo.svg/200px-Acer_Logo.svg.png" alt="Acer" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'acer.com',         visible: true },
  { id: 'samsung',       name: 'Samsung',       logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/200px-Samsung_Logo.svg.png" alt="Samsung" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'samsung.com',      visible: true },
  { id: 'lg',            name: 'LG',            logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/LG_logo_%282014%29.svg/200px-LG_logo_%282014%29.svg.png" alt="LG" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'lg.com',           visible: true },
  { id: 'corsair',       name: 'Corsair',       logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Corsair_Gaming_logo.svg/200px-Corsair_Gaming_logo.svg.png" alt="Corsair" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'corsair.com',      visible: true },
  { id: 'logitech',      name: 'Logitech',      logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Logitech_logo_%282015%29.svg/200px-Logitech_logo_%282015%29.svg.png" alt="Logitech" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'logitech.com',     visible: true },
  { id: 'razer',         name: 'Razer',         logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Razer_snake_logo.svg/200px-Razer_snake_logo.svg.png" alt="Razer" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'razer.com',        visible: true },
  { id: 'intel',         name: 'Intel',         logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/200px-Intel_logo_%282006-2020%29.svg.png" alt="Intel" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'intel.com',        visible: true },
  { id: 'amd',           name: 'AMD',           logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/AMD_logo_%282017%29.svg/200px-AMD_logo_%282017%29.svg.png" alt="AMD" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'amd.com',          visible: true },
  { id: 'nvidia',        name: 'NVIDIA',        logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Nvidia_logo.svg/200px-Nvidia_logo.svg.png" alt="NVIDIA" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'nvidia.com',       visible: true },
  { id: 'kingston',      name: 'Kingston',      logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Kingston_Technology_Logo.svg/200px-Kingston_Technology_Logo.svg.png" alt="Kingston" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'kingston.com',     visible: true },
  { id: 'wd',            name: 'Western Digital',logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Western_Digital_logo.svg/200px-Western_Digital_logo.svg.png" alt="Western Digital" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'wd.com',          visible: true },
  { id: 'seagate',       name: 'Seagate',       logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Seagate_logo.svg/200px-Seagate_logo.svg.png" alt="Seagate" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'seagate.com',      visible: true },
  { id: 'cooler-master', name: 'Cooler Master', logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Cooler_Master_logo.svg/200px-Cooler_Master_logo.svg.png" alt="Cooler Master" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'coolermaster.com', visible: true },
  { id: 'nzxt',          name: 'NZXT',          logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/NZXT_logo.svg/200px-NZXT_logo.svg.png" alt="NZXT" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'nzxt.com',         visible: true },
  { id: 'steelseries',   name: 'SteelSeries',   logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/SteelSeries_logo.svg/200px-SteelSeries_logo.svg.png" alt="SteelSeries" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'steelseries.com',  visible: true },
  { id: 'hyperx',        name: 'HyperX',        logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/HyperX_logo.svg/200px-HyperX_logo.svg.png" alt="HyperX" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'hyperx.com',       visible: true },
  { id: 'benq',          name: 'BenQ',          logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/BenQ_logo.svg/200px-BenQ_logo.svg.png" alt="BenQ" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'benq.com',         visible: true },
  { id: 'viewsonic',     name: 'ViewSonic',     logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/ViewSonic_logo.svg/200px-ViewSonic_logo.svg.png" alt="ViewSonic" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'viewsonic.com',    visible: true },
  { id: 'tp-link',       name: 'TP-Link',       logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/TP-Link_logo.svg/200px-TP-Link_logo.svg.png" alt="TP-Link" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'tp-link.com',      visible: true },
  { id: 'netgear',       name: 'Netgear',       logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Netgear_logo.svg/200px-Netgear_logo.svg.png" alt="Netgear" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'netgear.com',      visible: true },
  { id: 'canon',         name: 'Canon',         logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Canon_logo.svg/200px-Canon_logo.svg.png" alt="Canon" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'canon.com',        visible: true },
  { id: 'epson',         name: 'Epson',         logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Seiko_Epson_logo.svg/200px-Seiko_Epson_logo.svg.png" alt="Epson" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'epson.com',        visible: true },
  { id: 'apc',           name: 'APC',           logo: '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/APC_by_Schneider_Electric_logo.svg/200px-APC_by_Schneider_Electric_logo.svg.png" alt="APC" style="max-height:40px;max-width:80px;object-fit:contain">', website: 'apc.com',          visible: true },
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
