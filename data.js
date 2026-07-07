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
  { id: 'asus',          name: 'ASUS',          logo: '<img src="https://logo.clearbit.com/asus.com" alt="ASUS" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">ASUS</span>', website: 'asus.com',         visible: true },
  { id: 'msi',           name: 'MSI',           logo: '<img src="https://logo.clearbit.com/msi.com" alt="MSI" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">MSI</span>', website: 'msi.com',          visible: true },
  { id: 'gigabyte',      name: 'Gigabyte',      logo: '<img src="https://logo.clearbit.com/gigabyte.com" alt="Gigabyte" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Gigabyte</span>', website: 'gigabyte.com',     visible: true },
  { id: 'apple',         name: 'Apple',         logo: '<img src="https://logo.clearbit.com/apple.com" alt="Apple" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Apple</span>', website: 'apple.com',        visible: true },
  { id: 'dell',          name: 'Dell',          logo: '<img src="https://logo.clearbit.com/dell.com" alt="Dell" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Dell</span>', website: 'dell.com',         visible: true },
  { id: 'hp',            name: 'HP',            logo: '<img src="https://logo.clearbit.com/hp.com" alt="HP" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">HP</span>', website: 'hp.com',           visible: true },
  { id: 'lenovo',        name: 'Lenovo',        logo: '<img src="https://logo.clearbit.com/lenovo.com" alt="Lenovo" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Lenovo</span>', website: 'lenovo.com',       visible: true },
  { id: 'acer',          name: 'Acer',          logo: '<img src="https://logo.clearbit.com/acer.com" alt="Acer" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Acer</span>', website: 'acer.com',         visible: true },
  { id: 'samsung',       name: 'Samsung',       logo: '<img src="https://logo.clearbit.com/samsung.com" alt="Samsung" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Samsung</span>', website: 'samsung.com',      visible: true },
  { id: 'lg',            name: 'LG',            logo: '<img src="https://logo.clearbit.com/lg.com" alt="LG" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">LG</span>', website: 'lg.com',           visible: true },
  { id: 'corsair',       name: 'Corsair',       logo: '<img src="https://logo.clearbit.com/corsair.com" alt="Corsair" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Corsair</span>', website: 'corsair.com',      visible: true },
  { id: 'logitech',      name: 'Logitech',      logo: '<img src="https://logo.clearbit.com/logitech.com" alt="Logitech" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Logitech</span>', website: 'logitech.com',     visible: true },
  { id: 'razer',         name: 'Razer',         logo: '<img src="https://logo.clearbit.com/razer.com" alt="Razer" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Razer</span>', website: 'razer.com',        visible: true },
  { id: 'intel',         name: 'Intel',         logo: '<img src="https://logo.clearbit.com/intel.com" alt="Intel" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Intel</span>', website: 'intel.com',        visible: true },
  { id: 'amd',           name: 'AMD',           logo: '<img src="https://logo.clearbit.com/amd.com" alt="AMD" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">AMD</span>', website: 'amd.com',          visible: true },
  { id: 'nvidia',        name: 'NVIDIA',        logo: '<img src="https://logo.clearbit.com/nvidia.com" alt="NVIDIA" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">NVIDIA</span>', website: 'nvidia.com',       visible: true },
  { id: 'kingston',      name: 'Kingston',      logo: '<img src="https://logo.clearbit.com/kingston.com" alt="Kingston" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Kingston</span>', website: 'kingston.com',     visible: true },
  { id: 'wd',            name: 'Western Digital',logo: '<img src="https://logo.clearbit.com/wd.com" alt="Western Digital" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">WD</span>', website: 'wd.com',          visible: true },
  { id: 'seagate',       name: 'Seagate',       logo: '<img src="https://logo.clearbit.com/seagate.com" alt="Seagate" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Seagate</span>', website: 'seagate.com',      visible: true },
  { id: 'cooler-master', name: 'Cooler Master', logo: '<img src="https://logo.clearbit.com/coolermaster.com" alt="Cooler Master" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Cooler Master</span>', website: 'coolermaster.com', visible: true },
  { id: 'nzxt',          name: 'NZXT',          logo: '<img src="https://logo.clearbit.com/nzxt.com" alt="NZXT" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">NZXT</span>', website: 'nzxt.com',         visible: true },
  { id: 'steelseries',   name: 'SteelSeries',   logo: '<img src="https://logo.clearbit.com/steelseries.com" alt="SteelSeries" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">SteelSeries</span>', website: 'steelseries.com',  visible: true },
  { id: 'hyperx',        name: 'HyperX',        logo: '<img src="https://logo.clearbit.com/hyperx.com" alt="HyperX" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">HyperX</span>', website: 'hyperx.com',       visible: true },
  { id: 'benq',          name: 'BenQ',          logo: '<img src="https://logo.clearbit.com/benq.com" alt="BenQ" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">BenQ</span>', website: 'benq.com',         visible: true },
  { id: 'viewsonic',     name: 'ViewSonic',     logo: '<img src="https://logo.clearbit.com/viewsonic.com" alt="ViewSonic" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">ViewSonic</span>', website: 'viewsonic.com',    visible: true },
  { id: 'tp-link',       name: 'TP-Link',       logo: '<img src="https://logo.clearbit.com/tp-link.com" alt="TP-Link" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">TP-Link</span>', website: 'tp-link.com',      visible: true },
  { id: 'netgear',       name: 'Netgear',       logo: '<img src="https://logo.clearbit.com/netgear.com" alt="Netgear" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Netgear</span>', website: 'netgear.com',      visible: true },
  { id: 'canon',         name: 'Canon',         logo: '<img src="https://logo.clearbit.com/canon.com" alt="Canon" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Canon</span>', website: 'canon.com',        visible: true },
  { id: 'epson',         name: 'Epson',         logo: '<img src="https://logo.clearbit.com/epson.com" alt="Epson" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">Epson</span>', website: 'epson.com',        visible: true },
  { id: 'apc',           name: 'APC',           logo: '<img src="https://logo.clearbit.com/apc.com" alt="APC" style="max-height:48px;max-width:90px;object-fit:contain" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span style="display:none;font-size:1.2rem;font-weight:800">APC</span>', website: 'apc.com',          visible: true },
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
