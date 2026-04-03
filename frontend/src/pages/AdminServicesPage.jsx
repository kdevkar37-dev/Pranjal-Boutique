import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import { getImageUrl } from "../utils/imageUrl";
import { getServices } from "../api/serviceApi";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const categories = [
  { key: "AARI", label: "Aari Work" },
  { key: "EMBROIDERY", label: "Embroidery" },
  { key: "MEHENDI", label: "Mehendi Art" },
  { key: "FABRIC_PAINTING", label: "Fabric Painting" },
  { key: "FLOWER_JEWELLERY", label: "Flower Jewellery" },
  { key: "CUSTOM_DESIGN", label: "Custom Design" },
];

export default function AdminServicesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("AARI");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageFile: null,
    imageUrl: "",
  });

  // Load services
  useEffect(() => {
    async function load() {
      try {
        const data = await getServices();
        setServices(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading services:", err);
        setLoading(false);
      }
    }
    load();
  }, []);

  const categoryServices = services.filter(
    (s) => s.category === selectedCategory,
  );

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      imageUrl: service.imageUrl,
      imageFile: null,
    });
    // Use cache-busting for images to ensure fresh load from server
    setPreviewImage(getImageUrl(service.imageUrl, true));
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingService(null);
    setFormData({
      title: "",
      description: "",
      imageFile: null,
      imageUrl: "",
    });
    setPreviewImage(null);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("boutique-token");
      let imageUrl = formData.imageUrl;

      // Upload image if new one provided
      if (formData.imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", formData.imageFile);

        const uploadRes = await fetch(`${API_URL}/api/admin/images/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: imageFormData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;

        // Delete old image if updating
        if (editingService?.imageUrl) {
          try {
            await fetch(
              `${API_URL}/api/admin/images?imageUrl=${encodeURIComponent(editingService.imageUrl)}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              },
            );
          } catch (err) {
            console.error("Error deleting old image:", err);
          }
        }
      }

      // Create or update service
      const serviceUrl = editingService
        ? `${API_URL}/api/admin/services/${editingService.id}`
        : `${API_URL}/api/admin/services`;

      const method = editingService ? "PUT" : "POST";
      const serviceRes = await fetch(serviceUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          category: selectedCategory,
          description: formData.description,
          imageUrl: imageUrl,
        }),
      });

      if (!serviceRes.ok) throw new Error("Service save failed");

      // Reload services
      const data = await getServices();
      setServices(data);
      setShowForm(false);
      setEditingService(null);
      alert(
        editingService
          ? "Service updated successfully!"
          : "Service created successfully!",
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;

    try {
      const token = localStorage.getItem("boutique-token");
      const res = await fetch(`${API_URL}/api/admin/services/${serviceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      // Reload services
      const data = await getServices();
      setServices(data);
      alert("Service deleted successfully!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <p className="text-[color:var(--text-secondary)]">Loading...</p>
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
              Admin Panel
            </p>
            <h2 className="font-heading text-4xl">Manage Services</h2>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="rounded-full border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
          >
            Back
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === cat.key
                  ? "border-2 border-[#d4af37] bg-[#d4af37] text-black"
                  : "border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-2xl">
              {categories.find((c) => c.key === selectedCategory)?.label}
            </h3>
            <button
              onClick={handleAddNew}
              className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            >
              + Add Service
            </button>
          </div>

          {categoryServices.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryServices.map((service) => (
                <div
                  key={service.id}
                  className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]"
                >
                  <img
                    src={getImageUrl(service.imageUrl)}
                    alt={service.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="space-y-3 p-4">
                    <h4 className="font-semibold text-[color:var(--text-primary)]">
                      {service.title}
                    </h4>
                    <p className="text-sm text-[color:var(--text-secondary)]">
                      {service.description.substring(0, 100)}...
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="flex-1 rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="flex-1 rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[color:var(--text-secondary)]">
              No services for this category yet.
            </p>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl space-y-4 rounded-2xl border border-[#d4af37] bg-[color:var(--card)] p-8">
              <h3 className="font-heading text-2xl">
                {editingService ? "Edit Service" : "Add New Service"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-primary)]">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-4 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-primary)]">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-4 py-2 text-white focus:border-[#d4af37] focus:outline-none"
                    rows="4"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[color:var(--text-primary)]">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-lg border border-[color:var(--border)] bg-[#1a1a1a] px-4 py-2 text-white"
                  />
                  {previewImage && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs text-[color:var(--text-secondary)]">
                        Preview:
                      </p>
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="h-40 w-full rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-[#d4af37] px-4 py-2 font-semibold text-black transition hover:opacity-90"
                  >
                    {editingService ? "Update Service" : "Create Service"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-full border border-[#d4af37] px-4 py-2 font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </PageTransition>
  );
}
