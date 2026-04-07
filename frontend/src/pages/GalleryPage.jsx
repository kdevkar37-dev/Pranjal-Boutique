import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import ServiceCard from "../components/ServiceCard";
import { getServices } from "../api/serviceApi";

const fallbackServices = [
  {
    id: "fallback-1",
    title: "Aari Work",
    category: "AARI",
    description:
      "Royal zari and threadwork tailored for bridal and festive outfits.",
    imageUrl:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "fallback-2",
    title: "Embroidery",
    category: "EMBROIDERY",
    description:
      "Hand-finished embroidery with premium detailing and modern silhouettes.",
    imageUrl:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "fallback-3",
    title: "Mehendi Art",
    category: "MEHENDI",
    description:
      "Classic to contemporary mehendi patterns for brides and celebrations.",
    imageUrl:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "fallback-4",
    title: "Fabric Painting",
    category: "FABRIC_PAINTING",
    description:
      "Fashion-forward painted motifs curated for contemporary festive edits.",
    imageUrl:
      "https://images.unsplash.com/photo-1604480133435-25b86862d276?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "fallback-5",
    title: "Flower Jewellery",
    category: "FLOWER_JEWELLERY",
    description:
      "Fresh floral jewelry styling designed for haldi and mehendi ceremonies.",
    imageUrl:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "fallback-6",
    title: "Custom Design",
    category: "CUSTOM_DESIGN",
    description:
      "Personalized bridal customization and design consultation services.",
    imageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
  },
];

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [value];
}

export default function GalleryPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getServices();
        if (mounted) {
          setServices(toArray(data));
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.error || "Failed to load gallery");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const galleryCards = (() => {
    const byCategory = new Map();

    services.forEach((service) => {
      const categoryKey = (service.category || "").trim().toLowerCase();
      if (!categoryKey || byCategory.has(categoryKey)) {
        return;
      }
      byCategory.set(categoryKey, service);
    });

    const defaultCards = fallbackServices.map((fallback) => {
      const key = (fallback.category || "").trim().toLowerCase();
      return byCategory.get(key) || fallback;
    });

    const defaultCategoryKeys = new Set(
      fallbackServices.map((service) =>
        (service.category || "").trim().toLowerCase(),
      ),
    );

    const extraCards = Array.from(byCategory.entries())
      .filter(([key]) => !defaultCategoryKeys.has(key))
      .map(([, value]) => value);

    return [...defaultCards, ...extraCards];
  })();

  return (
    <PageTransition>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--accent)]">
              Gallery
            </p>
            <h2 className="font-heading text-4xl">Our Recent Work</h2>
          </div>
          <button
            onClick={() => navigate("/")}
            className="ui-btn-outline rounded-full px-4 py-2 text-sm font-semibold"
          >
            Back to Home
          </button>
        </div>

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <article
                key={item}
                className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]"
              >
                <div className="ui-skeleton h-56 w-full" />
                <div className="space-y-3 p-4">
                  <div className="ui-skeleton h-3 w-24 rounded" />
                  <div className="ui-skeleton h-5 w-3/4 rounded" />
                  <div className="ui-skeleton h-4 w-full rounded" />
                </div>
              </article>
            ))}
          </div>
        )}
        {error && (
          <p className="rounded-xl bg-red-100 px-4 py-2 text-red-700">
            {error}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryCards.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              backTarget="gallery-page"
            />
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
