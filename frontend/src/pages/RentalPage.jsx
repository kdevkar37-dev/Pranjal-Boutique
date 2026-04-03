import { useEffect, useMemo, useState } from "react";
import PageTransition from "../components/PageTransition";
import { getRentalProducts } from "../api/serviceApi";
import { getImageUrl } from "../utils/imageUrl";

const sections = ["RENTAL", "CUSTOMIZATION"];

export default function RentalPage() {
  const [products, setProducts] = useState([]);
  const [section, setSection] = useState("RENTAL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const sectionCounts = useMemo(() => {
    const counts = { RENTAL: 0, CUSTOMIZATION: 0 };
    products.forEach((product) => {
      const key = (product.section || "").trim().toUpperCase();
      if (key === "RENTAL" || key === "CUSTOMIZATION") {
        counts[key] += 1;
      }
    });
    return counts;
  }, [products]);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const data = await getRentalProducts();
        if (!mounted) {
          return;
        }
        setProducts(data || []);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setProducts([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setCategoryFilter("ALL");
  }, [section]);

  const sectionProducts = useMemo(
    () =>
      products.filter(
        (product) => (product.section || "").trim().toUpperCase() === section,
      ),
    [products, section],
  );

  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(
        sectionProducts
          .map((product) => (product.category || "").trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return ["ALL", ...categories];
  }, [sectionProducts]);

  const visibleProducts = useMemo(() => {
    if (categoryFilter === "ALL") {
      return sectionProducts;
    }

    return sectionProducts.filter(
      (product) =>
        (product.category || "").trim().toLowerCase() ===
        categoryFilter.toLowerCase(),
    );
  }, [sectionProducts, categoryFilter]);

  return (
    <PageTransition>
      <section className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--accent)]">
            Rental & Customization
          </p>
          <h2 className="font-heading text-4xl">Rental Collection</h2>
          <p className="mt-2 text-[color:var(--text-secondary)]">
            Browse products by category for rentals and custom orders.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {sections.map((value) => (
            <button
              key={value}
              onClick={() => setSection(value)}
              className={`ui-chip rounded-full px-4 py-2 text-sm font-semibold ${
                section === value ? "ui-chip-active" : ""
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {sections.map((value) => (
            <article
              key={value}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4"
            >
              <p className="text-xs uppercase tracking-widest text-[color:var(--text-secondary)]">
                {value}
              </p>
              <p className="mt-2 text-3xl font-bold text-[color:var(--accent)]">
                {sectionCounts[value]}
              </p>
              <p className="text-xs text-[color:var(--text-secondary)]">
                items available
              </p>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`ui-chip rounded-full px-4 py-2 text-sm font-semibold ${
                categoryFilter === category ? "ui-chip-active" : ""
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <article
                key={item}
                className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]"
              >
                <div className="ui-skeleton h-56 w-full" />
                <div className="space-y-2 p-4">
                  <div className="ui-skeleton h-3 w-24 rounded" />
                  <div className="ui-skeleton h-5 w-2/3 rounded" />
                  <div className="ui-skeleton h-4 w-full rounded" />
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && visibleProducts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[color:var(--accent)]/45 bg-[color:var(--card)] p-8 text-center">
            <p className="text-2xl font-semibold text-[color:var(--accent)]">
              Not Available
            </p>
            <p className="mt-2 text-[color:var(--text-secondary)]">
              {categoryFilter === "ALL"
                ? `No products are available in ${section} right now.`
                : `No products are available in ${section} / ${categoryFilter} right now.`}
            </p>
            <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
              Please check back soon for new listings.
            </p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]"
            >
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="h-56 w-full object-cover"
              />
              <div className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-widest text-[color:var(--accent)]">
                  {product.category}
                </p>
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="text-sm text-[color:var(--text-secondary)]">
                  {product.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
