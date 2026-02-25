import api from "../../api";

const SALON_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80"
];

const SPA_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80"
];

function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function inferType(record = {}) {
  if (record.type === "spa" || record.type === "salon") return record.type;
  return String(record.name || "").toLowerCase().includes("spa") ? "spa" : "salon";
}

function parseLocation(address = "") {
  const parts = String(address).split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]}, ${parts[1]}`;
  return parts[0] || "Location unavailable";
}

function mapSalonRecord(record) {
  const type = inferType(record);
  const fallbacks = type === "spa" ? SPA_FALLBACK_IMAGES : SALON_FALLBACK_IMAGES;
  const img = record.logo || fallbacks[0];

  return {
    id: String(record._id),
    slug: `${slugify(record.name)}-${String(record._id).slice(-6)}`,
    type,
    name: record.name || "Untitled",
    location: parseLocation(record.address),
    rating: Number(record.rating || (type === "spa" ? 4.7 : 4.5)),
    reviewsCount: Number(record.reviewsCount || 150),
    price: Number(record.price || (type === "spa" ? 1499 : 799)),
    address: record.address || "Address unavailable",
    about: record.description || (type === "spa" ? "Premium spa therapies and wellness rituals." : "Professional salon styling and grooming services."),
    category: record.category || (type === "spa" ? "Relaxation" : "Beauty"),
    tags: Array.isArray(record.tags) && record.tags.length > 0
      ? record.tags
      : (type === "spa" ? ["Massage", "Therapy", "Relaxation"] : ["Hair", "Skin", "Styling"]),
    images: [img, ...fallbacks.slice(1)],
    displayStatus: record.displayStatus || record.status || "open"
  };
}

export async function fetchPublicExperiences(type) {
  const params = {};
  if (type) params.type = type;

  const response = await api.get("/salons/public", { params });
  const items = Array.isArray(response.data) ? response.data : [];
  return items.map(mapSalonRecord);
}
