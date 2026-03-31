import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import { getServices } from "../api/serviceApi";

export default function ServiceDetailPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [currentService, setCurrentService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        console.log("Loading services for category:", category);
        const data = await getServices();
        console.log("All services received:", data);
        
        if (data && data.length > 0) {
          // Normalize category for comparison (uppercase)
          const normalizedCategory = category.toUpperCase();
          
          // Filter services by category (case-insensitive match)
          const filtered = data.filter((s) => {
            const serviceCategory = (s.category || "").toUpperCase();
            const isMatch = serviceCategory === normalizedCategory;
            console.log(`Comparing: "${serviceCategory}" === "${normalizedCategory}" => ${isMatch}`);
            return isMatch;
          });
          
          console.log("Filtered services:", filtered);
          
          // If matches found, use them; otherwise show all
          const servicesToShow = filtered.length > 0 ? filtered : data;
          setServices(servicesToShow);
          setCurrentService(servicesToShow[0]);
        } else {
          console.log("No services data received");
          setServices([]);
        }
      } catch (err) {
        console.error("Error loading services:", err);
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
            onClick={() => navigate("/gallery")}
            className="rounded-full border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#d4af37]"
          >
            ← Back to Gallery
          </button>
          <p className="text-[color:var(--text-secondary)]">No services found for category: {category}</p>
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
            onClick={() => navigate("/gallery")}
            className="rounded-full border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
          >
            ← Back
          </button>
        </div>

        {/* Main Image */}
        <div className="space-y-4">
          <p className="text-[color:var(--text-secondary)]">{currentService.description}</p>
          <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
            <img
              src={currentService.imageUrl}
              alt={currentService.title}
              className="h-96 w-full object-cover"
            />
          </div>
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
                    src={service.imageUrl}
                    alt={service.title}
                    className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="space-y-2 p-4">
                    <h4 className={`font-semibold ${
                      currentService.id === service.id 
                        ? "text-[#d4af37]" 
                        : "text-[color:var(--text-primary)]"
                    }`}>
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
    </PageTransition>
  );
}
