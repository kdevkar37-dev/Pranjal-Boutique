import { memo, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/imageUrl";

const whatsappNumber = "919373463181";

function ServiceCard({
  service,
  index = 0,
  isClickable = true,
  backTarget = "gallery-page",
}) {
  const message = useMemo(
    () =>
      encodeURIComponent(
        `Hello Pranjal, I saw the ${service.title} on your website and want to ask about classes.`,
      ),
    [service.title],
  );
  const whatsappLink = useMemo(
    () => `https://wa.me/${whatsappNumber}?text=${message}`,
    [message],
  );

  const handleWhatsAppClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(whatsappLink, "_blank");
    },
    [whatsappLink],
  );

  const categoryForUrl = useMemo(() => {
    const rawCategory = (service.category || service.title || "").trim();
    return encodeURIComponent(rawCategory);
  }, [service.category, service.title]);

  const cardContent = (
    <article
      className="group overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-aura transition hover:shadow-xl"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <img
        src={getImageUrl(service.imageUrl)}
        alt={service.title}
        loading="lazy"
        decoding="async"
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
      state={{ backTarget }}
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

export default memo(ServiceCard);
