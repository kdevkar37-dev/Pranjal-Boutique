import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import { getImageUrl } from "../utils/imageUrl";
import {
  createRentalProduct,
  deleteRentalProduct,
  getAdminRentalProducts,
  getRentalCategoryCounts,
  updateRentalProduct,
} from "../api/serviceApi";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const initialForm = {
  name: "",
  section: "RENTAL",
  category: "",
  description: "",
  imageUrl: "",
  imageFile: null,
};

export default function AdminRentalProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [status, setStatus] = useState("");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const [productData, countData] = await Promise.all([
        getAdminRentalProducts(),
        getRentalCategoryCounts(),
      ]);
      setProducts(productData);
      setCategoryCounts(countData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh().catch(() => setStatus("Could not load rental products"));
  }, []);

  const sectionOptions = ["ALL", "RENTAL", "CUSTOMIZATION"];

  const categoryOptions = useMemo(() => {
    const scoped = products.filter((product) => {
      if (sectionFilter === "ALL") {
        return true;
      }
      return (product.section || "").toUpperCase() === sectionFilter;
    });

    const categories = Array.from(
      new Set(
        scoped
          .map((product) => (product.category || "").trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return ["ALL", ...categories];
  }, [products, sectionFilter]);

  const visibleProducts = products.filter((product) => {
    const sectionMatch =
      sectionFilter === "ALL" ||
      (product.section || "").toUpperCase() === sectionFilter;
    const categoryMatch =
      categoryFilter === "ALL" ||
      (product.category || "").trim().toLowerCase() ===
        categoryFilter.toLowerCase();

    return sectionMatch && categoryMatch;
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("Saving product...");

    try {
      const token =
        sessionStorage.getItem("boutique-token") ||
        localStorage.getItem("boutique-token");
      let imageUrl = form.imageUrl;

      if (form.imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", form.imageFile);

        const uploadRes = await fetch(`${API_URL}/api/admin/images/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: imageFormData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}));
          throw new Error(errorData.error || "Image upload failed");
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
      }

      if (!imageUrl) {
        throw new Error("Image is required");
      }

      const payload = {
        name: form.name,
        section: form.section,
        category: form.category,
        description: form.description,
        imageUrl,
      };

      if (editingProduct) {
        await updateRentalProduct(editingProduct.id, payload);
      } else {
        await createRentalProduct(payload);
      }

      await refresh();
      setForm(initialForm);
      setPreviewImage(null);
      setEditingProduct(null);
      setStatus(editingProduct ? "✅ Product updated" : "✅ Product created");
    } catch (err) {
      setStatus(`❌ ${err.message || "Failed to save product"}`);
    }
  }

  function handleEdit(product) {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      section: (product.section || "RENTAL").toUpperCase(),
      category: product.category || "",
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      imageFile: null,
    });
    setPreviewImage(getImageUrl(product.imageUrl));
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      await deleteRentalProduct(id);
      await refresh();
      setStatus("✅ Product deleted");
    } catch (err) {
      setStatus(`❌ ${err.message || "Delete failed"}`);
    }
  }

  return (
    <PageTransition>
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--accent)]">
              Admin
            </p>
            <h2 className="font-heading text-4xl">Rental & Customization</h2>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="ui-btn-outline rounded-full px-4 py-2 text-sm font-semibold"
          >
            Back to Dashboard
          </button>
        </div>

        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <h3 className="mb-4 text-xl font-semibold">Category Records</h3>
          {categoryCounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[color:var(--accent)]/45 bg-[color:var(--surface)] p-6 text-center">
              <p className="text-xl font-semibold text-[color:var(--accent)]">
                Not Available
              </p>
              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                Category records are not available yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categoryCounts.map((record) => (
                <article
                  key={`${record.section}-${record.category}`}
                  className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
                >
                  <p className="text-xs uppercase tracking-widest text-[color:var(--text-secondary)]">
                    {record.section}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[color:var(--accent)]">
                    {record.category}
                  </p>
                  <p className="mt-2 text-2xl font-bold">{record.itemCount}</p>
                  <p className="text-xs text-[color:var(--text-secondary)]">
                    items | images: {record.imageCount}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6"
        >
          <h3 className="text-xl font-semibold">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h3>

          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
              placeholder="Product Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <select
              className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
            >
              <option value="RENTAL">RENTAL</option>
              <option value="CUSTOMIZATION">CUSTOMIZATION</option>
            </select>
            <input
              className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 md:col-span-2"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </div>

          <textarea
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
            placeholder="Description"
            rows="3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />

          <div>
            <label className="mb-2 block text-sm font-semibold">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setForm({ ...form, imageFile: file });
                  const reader = new FileReader();
                  reader.onloadend = () => setPreviewImage(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mt-3 max-h-40 rounded-lg"
              />
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="ui-btn-primary rounded-full px-5 py-2 font-semibold"
            >
              {editingProduct ? "Update Product" : "Create Product"}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setForm(initialForm);
                  setPreviewImage(null);
                }}
                className="ui-btn-outline rounded-full px-5 py-2 font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {sectionOptions.map((value) => (
              <button
                key={value}
                onClick={() => {
                  setSectionFilter(value);
                  setCategoryFilter("ALL");
                }}
                className={`ui-chip rounded-full px-4 py-2 text-sm font-semibold ${
                  sectionFilter === value ? "ui-chip-active" : ""
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {categoryOptions.length > 1 &&
              categoryOptions.map((value) => (
                <button
                  key={value}
                  onClick={() => setCategoryFilter(value)}
                  className={`ui-chip rounded-full px-4 py-2 text-sm font-semibold ${
                    categoryFilter === value ? "ui-chip-active" : ""
                  }`}
                >
                  {value}
                </button>
              ))}
          </div>

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <article
                  key={item}
                  className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]"
                >
                  <div className="ui-skeleton h-44 w-full" />
                  <div className="space-y-2 p-4">
                    <div className="ui-skeleton h-3 w-28 rounded" />
                    <div className="ui-skeleton h-5 w-2/3 rounded" />
                    <div className="ui-skeleton h-4 w-full rounded" />
                    <div className="ui-skeleton h-8 w-full rounded" />
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]"
                >
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="h-44 w-full object-cover"
                  />
                  <div className="space-y-2 p-4">
                    <p className="text-xs uppercase tracking-widest text-[color:var(--accent)]">
                      {product.section} | {product.category}
                    </p>
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-[color:var(--text-secondary)] line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleEdit(product)}
                        className="ui-btn-primary flex-1 rounded px-3 py-2 text-xs font-semibold"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="ui-btn-danger flex-1 rounded px-3 py-2 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && visibleProducts.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-[color:var(--accent)]/45 bg-[color:var(--surface)] p-6 text-center">
              <p className="text-xl font-semibold text-[color:var(--accent)]">
                Not Available
              </p>
              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                No products are available in this filter yet.
              </p>
            </div>
          )}
        </section>

        {status && (
          <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <p className="text-sm text-[color:var(--text-secondary)]">
              {status}
            </p>
          </div>
        )}
      </section>
    </PageTransition>
  );
}
