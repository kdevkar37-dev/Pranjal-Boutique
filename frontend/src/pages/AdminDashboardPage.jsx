import { useEffect, useState } from "react";
import PageTransition from "../components/PageTransition";
import {
  createService,
  deleteService,
  getInquiries,
  getReviewAnalytics,
  getReviews,
  getServices,
  updateService,
  updateInquiryStatus,
} from "../api/serviceApi";

const initialService = {
  title: "",
  category: "AARI",
  description: "",
  imageUrl: "",
};

export default function AdminDashboardPage() {
  const [serviceForm, setServiceForm] = useState(initialService);
  const [services, setServices] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewAnalytics, setReviewAnalytics] = useState(null);
  const [imageDrafts, setImageDrafts] = useState({});
  const [status, setStatus] = useState("");

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
      await createService(serviceForm);
      setServiceForm(initialService);
      await refresh();
      setStatus("Service created");
    } catch (err) {
      setStatus(err.response?.data?.error || "Unable to create service");
    }
  }

  async function handleDeleteService(id) {
    try {
      await deleteService(id);
      await refresh();
      setStatus("Service deleted");
    } catch {
      setStatus("Unable to delete service");
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

        <form
          onSubmit={handleCreateService}
          className="grid gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 md:grid-cols-2"
        >
          <input
            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
            placeholder="Title"
            value={serviceForm.title}
            onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
            required
          />
          <select
            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
            value={serviceForm.category}
            onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
          >
            <option value="AARI">Aari</option>
            <option value="MEHENDI">Mehendi</option>
            <option value="EMBROIDERY">Embroidery</option>
          </select>
          <input
            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 md:col-span-2"
            placeholder="Image URL (Cloudinary/S3)"
            value={serviceForm.imageUrl}
            onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
            required
          />
          <textarea
            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 md:col-span-2"
            placeholder="Description"
            value={serviceForm.description}
            onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-fit rounded-full bg-[color:var(--accent)] px-5 py-2 font-semibold text-[color:var(--accent-contrast)]"
          >
            Upload Work
          </button>
        </form>

        <section>
          <h3 className="font-heading text-3xl">Manage Gallery</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.id}
                className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4"
              >
                <img src={service.imageUrl} alt={service.title} className="h-32 w-full rounded object-cover" />
                <h4 className="mt-2 font-semibold">{service.title}</h4>
                <input
                  className="mt-2 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm"
                  placeholder="New image URL"
                  value={imageDrafts[service.id] || ""}
                  onChange={(e) =>
                    setImageDrafts((prev) => ({ ...prev, [service.id]: e.target.value }))
                  }
                />
                <button
                  type="button"
                  onClick={() => handleImageUpdate(service)}
                  className="mt-2 rounded-full border border-[#d4af37] px-3 py-1 text-sm text-[#d4af37]"
                >
                  Update Image
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteService(service.id)}
                  className="mt-2 rounded-full bg-red-600 px-3 py-1 text-sm text-white"
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-heading text-3xl">Orders / Class Inquiries</h3>
          <div className="mt-3 space-y-3">
            {inquiries.map((inquiry) => (
              <article
                key={inquiry.id}
                className="rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-4"
              >
                <p className="font-semibold">{inquiry.customerName} ({inquiry.phone})</p>
                <p className="text-sm text-[color:var(--text-secondary)]">{inquiry.serviceType}</p>
                <p className="my-2 text-sm">{inquiry.message}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Status: {inquiry.status}</span>
                  <button
                    type="button"
                    className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs"
                    onClick={() => handleStatus(inquiry.id, "CONTACTED")}
                  >
                    Mark Contacted
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs"
                    onClick={() => handleStatus(inquiry.id, "CLOSED")}
                  >
                    Mark Closed
                  </button>
                </div>
              </article>
            ))}
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
                    <p className="font-semibold">{review.reviewerName}</p>
                    <p className="text-sm text-[color:var(--accent)]">{"★".repeat(review.stars)}</p>
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
