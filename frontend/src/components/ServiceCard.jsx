import { Link } from "react-router-dom";

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";

// Category mapping for URL formatting
const categoryMap = {
  "AARI": "AARI",
  "EMBROIDERY": "EMBROIDERY",
  "MEHENDI": "MEHENDI",
  "FABRIC_PAINTING": "FABRIC_PAINTING",
  "FLOWER_JEWELLERY": "FLOWER_JEWELLERY",
  "CUSTOM_DESIGN": "CUSTOM_DESIGN",
  // Fallback for any variations
  "Aari Work": "AARI",
  "Embroidery": "EMBROIDERY",
  "Mehendi Art": "MEHENDI",
  "Fabric Painting": "FABRIC_PAINTING",
  "Flower Jewellery": "FLOWER_JEWELLERY",
  "Custom Design": "CUSTOM_DESIGN",
};

export default function ServiceCard({ service, index = 0, isClickable = true }) {
  const message = encodeURIComponent(
    `Hello Pranjal, I saw the ${service.title} on your website and want to ask about classes.`
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(whatsappLink, "_blank");
  };

  console.log("ServiceCard - service:", service);
  // Use category map to ensure consistent URL formatting
  const rawCategory = service.category || service.title;
  const categoryForUrl = categoryMap[rawCategory] || rawCategory.toUpperCase();
  console.log("Navigating to:", `/service/${categoryForUrl}`);

  const cardContent = (
    <article
      className="group overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-aura transition hover:shadow-xl"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <img
        src={service.imageUrl}
        alt={service.title}
        className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="space-y-3 p-4">
        <p className="text-xs uppercase tracking-widest text-[color:var(--accent)]">
          {service.category}
        </p>
        <h3 className="font-heading text-2xl text-[color:var(--text-primary)]">
          {service.title}
        </h3>
        <p className="text-sm text-[color:var(--text-secondary)]">
          {service.description}
        </p>
        <button
          onClick={handleWhatsAppClick}
          className="inline-block rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent-contrast)] transition hover:opacity-90"
        >
          Inquire on WhatsApp
        </button>
      </div>
    </article>
  );

  if (!isClickable) {
    return cardContent;
  }

  return (
    <Link 
      to={`/service/${categoryForUrl}`}
      className="block no-underline"
      onAuxClick={(e) => {
        // Allow middle-click to open in new tab
        if (e.button === 1) {
          e.preventDefault();
        }
      }}
    >
      {cardContent}
    </Link>
  );
}
