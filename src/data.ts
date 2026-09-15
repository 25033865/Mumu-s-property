import {
  HardHat, Wrench, Gauge, Zap, Layers, BedDouble,
  Pickaxe, Cog, Building2, Factory, Briefcase,
  ShieldCheck, TrendingDown, Boxes, Timer, Truck, ShieldAlert, MapPin,
} from "lucide-react";

const imgPalette = [
  ["#0b1730", "#17285c", "#d4a13a", "#eef4ff"],
  ["#101d45", "#2c4a8c", "#f2cf6b", "#f7f9ff"],
  ["#0f172a", "#3b4b7a", "#c89b2b", "#edf3ff"],
  ["#111827", "#243d7a", "#f4c25a", "#f5f7fb"],
];

export const img = (id: string, w = 1200, h = 800) => {
  const seed = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const [dark, mid, accent, light] = imgPalette[seed % imgPalette.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="g-${seed}" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${dark}" />
          <stop offset="55%" stop-color="${mid}" />
          <stop offset="100%" stop-color="${light}" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#g-${seed})"/>
      <circle cx="${w * 0.75}" cy="${h * 0.25}" r="${Math.min(w, h) * 0.62}" fill="${accent}" opacity="0.12"/>
      <circle cx="${w * 0.2}" cy="${h * 0.82}" r="${Math.min(w, h) * 0.45}" fill="${light}" opacity="0.11"/>
      <path d="M0 ${h * 0.72} L ${w * 0.16} ${h * 0.36} L ${w * 0.42} ${h * 0.72} L ${w * 0.66} ${h * 0.42} L ${w} ${h * 0.8} L ${w} ${h} L 0 ${h} Z" fill="${dark}" opacity="0.55"/>
      <path d="M0 ${h * 0.58} L ${w * 0.3} ${h * 0.2} L ${w * 0.58} ${h * 0.66} L ${w} ${h * 0.3} L ${w} ${h} L 0 ${h} Z" fill="${accent}" opacity="0.18"/>
      <g fill="${light}" opacity="0.22" font-family="Arial, Helvetica, sans-serif" font-size="${Math.max(28, Math.min(w, h) / 8)}" font-weight="700">
        <text x="${w * 0.12}" y="${h * 0.78}">${id.slice(0, 2).toUpperCase()}</text>
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const HERO_IMG = img("hero", 1600, 1100);

export const company = {
  name: "MUMUS PROPERTYS (PTY) LTD",
  slogan: "Mining | Engineering | Maintenance | PPE | Industrial Supplies",
  address: "Lephalale, Limpopo, South Africa",
  phone: "076 739 0661",
  email: "muanomamphogoro@gmail.com",
  reg: "2026/229589/07",
};

export const procurement = ["Glencore", "Anglo American", "Seriti"];

export const trustIndicators = [
  "Glencore, Anglo American & Seriti Procurement Alignment",
  "100% Quality & SABS Sourced Products",
  "24/7 Site Sourcing & Delivery Capability",
];

/* ---- CORE BUSINESS AREAS: every item from the company profile ---- */
export const offerings = [
  {
    slug: "ppe",
    letter: "A",
    icon: HardHat,
    title: "PPE & Occupational Safety",
    blurb: "Personal protective equipment and workplace safety products for high-risk environments.",
    image: img("1578091879915-33fc8c00d0c9", 900, 650),
    items: [
      "Safety helmets", "Dust masks", "Safety boots", "Safety gloves", "Safety goggles",
      "Face shields", "Reflective vests", "Workwear and overalls", "Respiratory protection",
      "Hearing protection", "Fall-arrest equipment", "Disposable overalls",
      "General occupational safety equipment",
    ],
  },
  {
    slug: "engineering",
    letter: "B",
    icon: Wrench,
    title: "Engineering & Mining Consumables",
    blurb: "Sourced and supplied according to client specifications for workshops and site operations.",
    image: img("1530124566582-a618bc2615dc", 900, 650),
    items: [
      "Bearings", "Fasteners", "Bolts and nuts", "Washers", "Welding consumables",
      "Abrasives", "Hand tools", "Power tools", "Workshop consumables", "Lubrication products",
      "Mechanical components", "Industrial consumables", "Maintenance materials",
    ],
  },
  {
    slug: "pumps",
    letter: "C",
    icon: Gauge,
    title: "Pumps, Valves & Electric Motors",
    blurb: "Fluid-handling and rotating equipment with OEM / client technical specification sourcing.",
    image: img("1620283085439-39620a1e21c4", 900, 650),
    items: [
      "Industrial pumps", "Water pumps", "Pump components", "Valves", "Pipe fittings",
      "Electric motors", "Motor components", "Mechanical equipment", "Fluid-handling equipment",
    ],
  },
  {
    slug: "electrical",
    letter: "D",
    icon: Zap,
    title: "Electrical Supplies",
    blurb: "Electrical products and consumables for installation, distribution and maintenance.",
    image: img("1473341304170-971dccb5ac1e", 900, 650),
    items: [
      "Switchgear", "Distribution equipment", "Electrical accessories", "Lighting equipment",
      "Electrical tools", "Cable accessories", "Electrical maintenance consumables", "Electric motors",
    ],
  },
  {
    slug: "insulation",
    letter: "E",
    icon: Layers,
    title: "Insulation Materials & Plastics",
    blurb: "Thermal insulation and industrial plastics supplied to project specifications.",
    image: img("1416879595882-3373a0480b5b", 900, 650),
    items: [
      "Insulation mattresses", "Pipe sections", "Insulation felts", "Insulation boards",
      "Ceramic fibre", "Loose wool / mineral wool insulation rolls", "Custom project insulation",
      "Black refuse bags", "Clear plastic bags", "Heavy-duty industrial refuse bags", "Custom industrial bags",
    ],
  },
  {
    slug: "accommodation",
    letter: "F",
    icon: BedDouble,
    title: "Accommodation Services",
    blurb: "Tailored contractor accommodation for personnel brought into mining and industrial areas.",
    image: img("1560448204-e02f11c3d0e2", 900, 650),
    items: [
      "Mining personnel", "Contractors", "Project teams", "Engineers", "Maintenance teams",
      "Business travellers", "Short- & medium-term assignments",
    ],
  },
];

/* ---- INDUSTRIES SERVED ---- */
export const industries = [
  { icon: Pickaxe, title: "Mining", desc: "Coal, platinum, chrome, manganese, gold, iron ore and general mining operations." },
  { icon: Cog, title: "Engineering", desc: "Mechanical, electrical, civil and industrial engineering contractors." },
  { icon: Building2, title: "Construction", desc: "Building contractors, infrastructure projects and construction companies." },
  { icon: Factory, title: "Industrial", desc: "Manufacturing plants, processing facilities, workshops and industrial operations." },
  { icon: Briefcase, title: "Commercial", desc: "Businesses requiring maintenance, PPE, equipment and general supplies." },
];

/* ---- WHY MUMUS PROPERTYS (7) ---- */
export const advantages = [
  { icon: ShieldCheck, title: "Reliable Sourcing", desc: "Products sourced to client specifications and required quality standards." },
  { icon: TrendingDown, title: "Competitive Pricing", desc: "Supplier pricing leverage and commercially competitive quotations." },
  { icon: Boxes, title: "Multiple Product Categories", desc: "PPE, consumables, equipment and materials through a single-source vendor." },
  { icon: Timer, title: "Responsive Service", desc: "Rapid RFQ response and urgent supply dispatch." },
  { icon: Truck, title: "Delivery Capability", desc: "Direct to client premises, projects and operational sites." },
  { icon: ShieldAlert, title: "Safety Focus", desc: "Aligned with occupational health and safety standards." },
  { icon: MapPin, title: "Local Supplier Focus", desc: "Positioned for local procurement and enterprise development." },
];

/* ---- SUPPLIER CATEGORY MATRIX (12) ---- */
export const supplierMatrix = [
  ["PPE", "Safety clothing, footwear, helmets, gloves, eye/face protection"],
  ["Mining Supplies", "Mining consumables and general site supplies"],
  ["Engineering Consumables", "Bearings, fasteners, abrasives, welding products"],
  ["Tools", "Hand tools, power tools, workshop equipment"],
  ["Pumps", "Industrial and water pumps"],
  ["Valves", "Industrial valves and fittings"],
  ["Electric Motors", "Motors and related components"],
  ["Electrical", "Cables, switchgear, lighting and accessories"],
  ["Mechanical", "Mechanical components and maintenance materials"],
  ["Equipment", "Industrial and site equipment"],
  ["Accommodation", "Contractor and business accommodation"],
  ["Supply & Delivery", "Procurement and delivery of goods"],
];

/* ---- HSE & QUALITY COMMITMENT (9) ---- */
export const hsePillars = [
  "Safe working practices",
  "Compliance with applicable legislation",
  "Quality products and services",
  "Responsible sourcing",
  "Competent service providers",
  "Risk-conscious operations",
  "Customer satisfaction",
  "Continuous improvement",
  "Ethical business practices",
];

export const stats = [
  { n: "12", l: "Supply Categories" },
  { n: "24/7", l: "Site Support" },
  { n: "5", l: "Industries Served" },
  { n: "100%", l: "SABS Sourced" },
];
