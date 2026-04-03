import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import { getImageUrl } from "../utils/imageUrl";
import { getServices } from "../api/serviceApi";

function normalizeCategory(value) {
  return decodeURIComponent((value || "").trim())
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export default function ServiceDetailPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [currentService, setCurrentService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullViewImage, setFullViewImage] = useState(null);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setFullViewImage(null);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleBack = () => {
    const backTarget = location.state?.backTarget;

    if (backTarget === "gallery-page") {
      navigate("/gallery");
      return;
    }

    if (backTarget === "home-gallery") {
      navigate("/?section=gallery");
      return;
    }

    navigate("/gallery");
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await getServices();
        const normalizedCategory = normalizeCategory(category);
        const filtered = (data || []).filter(
          (service) =>
            normalizeCategory(service.category) === normalizedCategory,
        );

        setServices(filtered);
        setCurrentService(filtered[0] || null);
      } catch (err) {
        setServices([]);
        setCurrentService(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [category]);

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <p className="text-[color:var(--text-secondary)]">Loading...</p>
        </div>
      </PageTransition>
    );
  }

  if (!currentService) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <button
            onClick={handleBack}
            className="rounded-full border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#d4af37]"
          >
            Back
          </button>
          <p className="text-[color:var(--text-secondary)]">
            No services found for category: {decodeURIComponent(category || "")}
          </p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <section className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--accent)]">
              {currentService.category}
            </p>
            <h2 className="font-heading text-4xl">{currentService.title}</h2>
          </div>
          <button
            onClick={handleBack}
            className="rounded-full border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
          >
            Back
          </button>
        </div>

        {/* Main Image */}
        <div className="space-y-4">
          <p className="text-[color:var(--text-secondary)]">
            {currentService.description}
          </p>
          <button
            type="button"
            onClick={() =>
              setFullViewImage(getImageUrl(currentService.imageUrl))
            }
            className="block w-full overflow-hidden rounded-2xl border border-[color:var(--border)]"
          >
            <img
              src={getImageUrl(currentService.imageUrl)}
              alt={currentService.title}
              className="h-96 w-full object-contain bg-black"
            />
          </button>
          <p className="text-xs text-[color:var(--text-secondary)]">
            Tap image to view full size
          </p>
        </div>

        {/* Gallery Grid */}
        {services.length > 0 && (
          <div>
            <h3 className="mb-6 font-heading text-3xl">Gallery Collection</h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.id}
                  onClick={() => setCurrentService(service)}
                  className={`group cursor-pointer overflow-hidden rounded-2xl transition ${
                    currentService.id === service.id
                      ? "border-2 border-[#d4af37] shadow-lg shadow-[#d4af37]/30"
                      : "border border-[color:var(--border)]"
                  } bg-[color:var(--card)] hover:shadow-lg`}
                >
                  <img
                    src={getImageUrl(service.imageUrl)}
                    alt={service.title}
                    onClick={(event) => {
                      event.stopPropagation();
                      setFullViewImage(getImageUrl(service.imageUrl));
                    }}
                    className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="space-y-2 p-4">
                    <h4
                      className={`font-semibold ${
                        currentService.id === service.id
                          ? "text-[#d4af37]"
                          : "text-[color:var(--text-primary)]"
                      }`}
                    >
                      {service.title}
                    </h4>
                    <p className="text-xs text-[color:var(--text-secondary)]">
                      {service.description.substring(0, 60)}...
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {fullViewImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullViewImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setFullViewImage(null)}
            className="absolute right-4 top-4 rounded-full border border-white/40 px-3 py-1 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Close
          </button>
          <img
            src={fullViewImage}
            alt="Full view service"
            className="max-h-[92vh] max-w-[96vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </PageTransition>
  );
}
