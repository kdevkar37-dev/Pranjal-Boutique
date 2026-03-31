import { useEffect, useState } from "react";
import PageTransition from "../components/PageTransition";
import {
  getInquiries,
  getReviewAnalytics,
  getReviews,
  getServices,
  updateInquiryStatus,
  respondToInquiry,
  deleteReview,
  getAdminReviews,
} from "../api/serviceApi";

const initialService = {
  title: "",
  category: "AARI",
  description: "",
  imageUrl: "",
  imageFile: null,
};

const categories = [
  { key: "AARI", label: "Aari Work" },
  { key: "EMBROIDERY", label: "Embroidery" },
  { key: "MEHENDI", label: "Mehendi Art" },
  { key: "FABRIC_PAINTING", label: "Fabric Painting" },
  { key: "FLOWER_JEWELLERY", label: "Flower Jewellery" },
  { key: "CUSTOM_DESIGN", label: "Custom Design" },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function AdminDashboardPage() {
  const [serviceForm, setServiceForm] = useState(initialService);
  const [services, setServices] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewAnalytics, setReviewAnalytics] = useState(null);
  const [imageDrafts, setImageDrafts] = useState({});
  const [status, setStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("AARI");
  const [editingService, setEditingService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedInquiryStatus, setSelectedInquiryStatus] = useState("ALL");
  const [inquiryResponses, setInquiryResponses] = useState({});
  const [expandedInquiry, setExpandedInquiry] = useState(null);
  async function refresh() {
    const [serviceData, inquiryData, reviewData, reviewAnalyticsData] = await Promise.all([
      getServices(),
      getInquiries(),
      getReviews(),
      getReviewAnalytics(),
    ]);
    setServices(serviceData);
    setInquiries(inquiryData);
    setReviews(reviewData);
    setReviewAnalytics(reviewAnalyticsData);
    setImageDrafts(
      serviceData.reduce((acc, service) => {
        acc[service.id] = service.imageUrl || "";
        return acc;
      }, {})
    );
  }

  useEffect(() => {
    refresh().catch(() => setStatus("Could not load admin data"));
  }, []);

  async function handleCreateService(event) {
    event.preventDefault();
    setStatus("Uploading service...");
    try {
      const token = localStorage.getItem("boutique-token");
      let imageUrl = serviceForm.imageUrl;

      // Upload image if file selected
      if (serviceForm.imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", serviceForm.imageFile);

        const uploadRes = await fetch(`${API_URL}/api/admin/images/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: imageFormData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
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
          title: serviceForm.title,
          category: selectedCategory,
          description: serviceForm.description,
          imageUrl: imageUrl,
        }),
      });

      if (!serviceRes.ok) throw new Error("Service save failed");

      // Reload and reset
      await refresh();
      setServiceForm(initialService);
      setEditingService(null);
      setShowServiceForm(false);
      setPreviewImage(null);
      setStatus(editingService ? "Service updated!" : "Service created!");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  function handleEditService(service) {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      category: service.category,
      description: service.description,
      imageUrl: service.imageUrl,
    });
    setPreviewImage(service.imageUrl);
    setShowServiceForm(true);
  }

  function handleAddNew() {
    setEditingService(null);
    setServiceForm({ ...initialService, category: selectedCategory });
    setPreviewImage(null);
    setShowServiceForm(true);
  }

  async function handleDeleteService(id) {
    if (!window.confirm("Delete this service?")) return;
    try {
      const token = localStorage.getItem("boutique-token");
      const res = await fetch(`${API_URL}/api/admin/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      await refresh();
      setStatus("Service deleted");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleStatus(id, nextStatus) {
    try {
      await updateInquiryStatus(id, nextStatus);
      await refresh();
      setStatus("Inquiry updated");
    } catch {
      setStatus("Unable to update inquiry");
    }
  }

  async function handleRespondToInquiry(inquiryId) {
    const response = inquiryResponses[inquiryId]?.trim();
    if (!response) {
      setStatus("⚠️ Please enter a response message");
      return;
    }
    try {
      await respondToInquiry(inquiryId, response);
      setInquiryResponses({ ...inquiryResponses, [inquiryId]: "" });
      setExpandedInquiry(null);
      await refresh();
      setStatus("✅ Response sent to customer");
    } catch (err) {
      setStatus(`❌ Failed to send response: ${err.message}`);
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }
    try {
      await deleteReview(reviewId);
      await refresh();
      setStatus("✅ Review deleted successfully");
    } catch (err) {
      setStatus(`❌ Failed to delete review: ${err.message}`);
    }
  }

  async function handleImageUpdate(service) {
    const nextImageUrl = imageDrafts[service.id]?.trim();
    if (!nextImageUrl) {
      setStatus("Image URL is required");
      return;
    }

    try {
      await updateService(service.id, {
        title: service.title,
        category: service.category,
        description: service.description,
        imageUrl: nextImageUrl,
      });
      await refresh();
      setStatus("Image updated successfully");
    } catch (err) {
      setStatus(err.response?.data?.error || "Unable to update image");
    }
  }

  return (
    <PageTransition>
      <section className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--accent)]">Admin</p>
          <h2 className="font-heading text-4xl">Dashboard</h2>
        </div>

        <form onSubmit={handleCreateService} className="space-y-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
              placeholder="Title"
              value={serviceForm.title}
              onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
              required
            />
            <select
              className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setServiceForm({ ...serviceForm, category: e.target.value });
              }}
            >
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
            placeholder="Description"
            value={serviceForm.description}
            onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
            rows="3"
            required
          />
          <div>
            <label className="block text-sm font-semibold mb-2">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setServiceForm({ ...serviceForm, imageFile: file });
                  const reader = new FileReader();
                  reader.onloadend = () => setPreviewImage(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
              className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 w-full"
            />
            {previewImage && (
              <img src={previewImage} alt="Preview" className="mt-3 max-h-40 rounded-lg" />
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-full bg-[color:var(--accent)] px-5 py-2 font-semibold text-[color:var(--accent-contrast)]"
            >
              {editingService ? "Update Service" : "Create Service"}
            </button>
            {editingService && (
              <button
                type="button"
                onClick={() => {
                  setEditingService(null);
                  setServiceForm(initialService);
                  setPreviewImage(null);
                }}
                className="rounded-full border border-[#d4af37] px-5 py-2 font-semibold text-[#d4af37]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section>
          <div className="mb-6">
            <h3 className="font-heading text-3xl mb-4">Manage Services</h3>
            <div className="flex flex-wrap gap-2 mb-6">
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
            {!showServiceForm && (
              <button
                onClick={handleAddNew}
                className="rounded-full bg-[#d4af37] px-6 py-2 font-semibold text-black hover:opacity-90"
              >
                + Add New Service
              </button>
            )}
          </div>

          {showServiceForm && (
            <form onSubmit={handleCreateService} className="space-y-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 mb-8">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
                  placeholder="Title"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  required
                />
                <select
                  className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setServiceForm({ ...serviceForm, category: e.target.value });
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
                placeholder="Description"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                rows="3"
                required
              />
              <div>
                <label className="block text-sm font-semibold mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setServiceForm({ ...serviceForm, imageFile: file });
                      const reader = new FileReader();
                      reader.onloadend = () => setPreviewImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 w-full"
                />
                {previewImage && (
                  <img src={previewImage} alt="Preview" className="mt-3 max-h-40 rounded-lg" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-[color:var(--accent)] px-5 py-2 font-semibold text-[color:var(--accent-contrast)]"
                >
                  {editingService ? "Update Service" : "Create Service"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingService(null);
                    setServiceForm(initialService);
                    setShowServiceForm(false);
                    setPreviewImage(null);
                  }}
                  className="rounded-full border border-[#d4af37] px-5 py-2 font-semibold text-[#d4af37]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services
              .filter((s) => s.category === selectedCategory)
              .map((service) => (
                <article
                  key={service.id}
                  className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 overflow-hidden"
                >
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="h-40 w-full rounded object-cover mb-3"
                  />
                  <h4 className="font-semibold mb-2">{service.title}</h4>
                  <p className="text-sm text-[color:var(--text-secondary)] mb-3 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditService(service)}
                      className="flex-1 rounded bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="flex-1 rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
          </div>

          {services.filter((s) => s.category === selectedCategory).length === 0 && !showServiceForm && (
            <p className="text-center text-[color:var(--text-secondary)] mt-8">
              No services for this category yet.
            </p>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--accent)]">
                Inquiries
              </p>
              <h3 className="font-heading text-3xl">Customer Inquiries & Orders</h3>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[#d4af37]/30 bg-gradient-to-br from-[#d4af37]/10 to-[#d4af37]/5 p-4">
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-secondary)]">
                Total Inquiries
              </p>
              <p className="mt-2 text-3xl font-bold text-[#d4af37]">{inquiries.length}</p>
            </div>
            <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-4">
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-secondary)]">
                Pending
              </p>
              <p className="mt-2 text-3xl font-bold text-yellow-400">
                {inquiries.filter((i) => i.status === "PENDING").length}
              </p>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-4">
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-secondary)]">
                Contacted
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-400">
                {inquiries.filter((i) => i.status === "CONTACTED").length}
              </p>
            </div>
            <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 p-4">
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-secondary)]">
                Closed
              </p>
              <p className="mt-2 text-3xl font-bold text-green-400">
                {inquiries.filter((i) => i.status === "CLOSED").length}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {["ALL", "PENDING", "CONTACTED", "CLOSED"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedInquiryStatus(filter)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedInquiryStatus === filter
                    ? "border-2 border-[#d4af37] bg-[#d4af37] text-black"
                    : "border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Inquiries Grid */}
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-12 text-center">
                <p className="text-[color:var(--text-secondary)]">No inquiries yet.</p>
              </div>
            ) : (
              inquiries
                .filter((i) => selectedInquiryStatus === "ALL" || i.status === selectedInquiryStatus)
                .map((inquiry) => {
                  const statusConfig = {
                    PENDING: {
                      color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
                      bgColor: "from-yellow-500/5 to-yellow-500/0",
                      icon: "⏳",
                    },
                    CONTACTED: {
                      color: "bg-blue-500/20 text-blue-300 border-blue-500/50",
                      bgColor: "from-blue-500/5 to-blue-500/0",
                      icon: "📞",
                    },
                    CLOSED: {
                      color: "bg-green-500/20 text-green-300 border-green-500/50",
                      bgColor: "from-green-500/5 to-green-500/0",
                      icon: "✓",
                    },
                  };

                  const config = statusConfig[inquiry.status] || statusConfig.PENDING;

                  return (
                    <div
                      key={inquiry.id}
                      className={`rounded-2xl border border-[color:var(--border)] bg-gradient-to-br ${config.bgColor} bg-[color:var(--card)] p-6 transition hover:shadow-lg`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-xl font-semibold text-[color:var(--text-primary)]">
                                {inquiry.customerName}
                              </h4>
                              <p className="text-sm text-[color:var(--text-secondary)]">
                                📞 {inquiry.phone}
                              </p>
                            </div>
                            <div className={`rounded-full border ${config.color} px-4 py-2 text-sm font-semibold`}>
                              {config.icon} {inquiry.status}
                            </div>
                          </div>

                          {/* Service Type & Message */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-[#d4af37]/20 px-3 py-1 text-xs font-semibold text-[#d4af37]">
                                {inquiry.serviceType}
                              </span>
                            </div>
                            <div className="rounded-lg bg-[#0a0a0a]/50 p-4">
                              <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
                                {inquiry.message}
                              </p>
                            </div>

                            {/* Admin Response */}
                            {inquiry.adminResponse && (
                              <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
                                <p className="text-xs font-semibold text-green-400 mb-2">✅ Your Response:</p>
                                <p className="text-sm text-[color:var(--text-secondary)]">
                                  {inquiry.adminResponse}
                                </p>
                                {inquiry.respondedAt && (
                                  <p className="text-xs text-[color:var(--text-secondary)] mt-2">
                                    Responded: {new Date(inquiry.respondedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Response Input */}
                            {!inquiry.adminResponse && (
                              <div className="rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 p-4 space-y-3">
                                <label className="block text-xs font-semibold text-[#d4af37]">
                                  💬 Send Response to Customer
                                </label>
                                <textarea
                                  value={inquiryResponses[inquiry.id] || ""}
                                  onChange={(e) => setInquiryResponses({ ...inquiryResponses, [inquiry.id]: e.target.value })}
                                  placeholder="Type your response here..."
                                  className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-secondary)]"
                                  rows="3"
                                />
                                <button
                                  onClick={() => handleRespondToInquiry(inquiry.id)}
                                  className="w-full rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#e5c158]"
                                >
                                  📤 Send Response
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {inquiry.status !== "CONTACTED" && (
                              <button
                                onClick={() => handleStatus(inquiry.id, "CONTACTED")}
                                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                              >
                                📞 Mark Contacted
                              </button>
                            )}
                            {inquiry.status !== "CLOSED" && (
                              <button
                                onClick={() => handleStatus(inquiry.id, "CLOSED")}
                                className="rounded-full bg-green-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                              >
                                ✓ Mark Closed
                              </button>
                            )}
                            {inquiry.status === "CLOSED" && (
                              <button
                                onClick={() => handleStatus(inquiry.id, "PENDING")}
                                className="rounded-full bg-[#d4af37]/20 px-6 py-2 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37]/30"
                              >
                                ↻ Reopen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </section>

        <section>
          <h3 className="font-heading text-3xl">Review Analytics</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-secondary)]">
                Average Rating
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {reviewAnalytics?.averageRating?.toFixed(1) || "0.0"}
                <span className="ml-1 text-lg text-[color:var(--accent)]">/5</span>
              </p>
            </article>
            <article className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-secondary)]">
                Total Reviews
              </p>
              <p className="mt-2 text-3xl font-semibold">{reviewAnalytics?.totalReviews || 0}</p>
            </article>
          </div>

          <div className="mt-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
            <h4 className="text-lg font-semibold">Rating Distribution</h4>
            <div className="mt-3 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviewAnalytics?.starDistribution?.[star] || 0;
                const total = reviewAnalytics?.totalReviews || 0;
                const percentage = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-14 text-sm">{star} star</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[color:var(--surface)]">
                      <div className="h-full bg-[color:var(--accent)]" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-10 text-right text-xs text-[color:var(--text-secondary)]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4">
            <h4 className="text-lg font-semibold">All Reviews</h4>
            <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto">
              {reviews.length === 0 && (
                <p className="text-sm text-[color:var(--text-secondary)]">No reviews posted yet.</p>
              )}
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold">{review.reviewerName}</p>
                      <p className="text-sm text-[color:var(--accent)]">{"★".repeat(review.stars)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-500/40"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{review.message}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {status && <p className="text-sm text-[color:var(--text-secondary)]">{status}</p>}
      </section>
    </PageTransition>
  );
}
