import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import StatusToast from "../components/StatusToast";
import { createInquiry, getSiteSettings } from "../api/serviceApi";

const initialForm = {
  customerName: "",
  phone: "",
  serviceType: "Aari",
  message: "",
};

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 text-[#d4af37]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.46-1.28a2 2 0 0 1 2.11-.45c.85.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 text-[#d4af37]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function buildMapEmbedUrl(googleMapsUrl, location) {
  const fallbackQuery = encodeURIComponent(
    location || "Pune, Maharashtra, India",
  );

  if (!googleMapsUrl) {
    return `https://www.google.com/maps?q=${fallbackQuery}&output=embed`;
  }

  try {
    const parsed = new URL(googleMapsUrl);

    if (parsed.pathname.includes("/maps/embed")) {
      return googleMapsUrl;
    }

    const query =
      parsed.searchParams.get("q") || parsed.searchParams.get("query");
    if (query) {
      return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    }

    if (parsed.pathname.includes("/place/")) {
      const placePart = decodeURIComponent(
        parsed.pathname.split("/place/")[1] || "",
      )
        .split("/")[0]
        .replace(/\+/g, " ");
      if (placePart) {
        return `https://www.google.com/maps?q=${encodeURIComponent(placePart)}&output=embed`;
      }
    }
  } catch {
    // Fallback to location text when URL parsing fails.
  }

  return `https://www.google.com/maps?q=${fallbackQuery}&output=embed`;
}

export default function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");
  const [siteSettings, setSiteSettings] = useState({
    contactNumbers: ["+91 98765 43210", "+91 99887 76655"],
    location: "Pune, Maharashtra, India",
    googleMapsUrl: "",
  });

  useEffect(() => {
    let mounted = true;

    async function loadSiteSettings() {
      try {
        const data = await getSiteSettings();
        if (!mounted) {
          return;
        }

        setSiteSettings({
          contactNumbers:
            data?.contactNumbers?.length > 0
              ? data.contactNumbers
              : [data?.contactNumber || "+91 98765 43210"],
          location: data?.location || "Pune, Maharashtra, India",
          googleMapsUrl: data?.googleMapsUrl || "",
        });
      } catch {
        if (!mounted) {
          return;
        }
        setSiteSettings({
          contactNumbers: ["+91 98765 43210", "+91 99887 76655"],
          location: "Pune, Maharashtra, India",
          googleMapsUrl: "",
        });
      }
    }

    loadSiteSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const whatsappLink = "https://wa.me/919373463181";
  const instagramLink = "https://www.instagram.com/pranjalsdesigner/";
  const mapsLink =
    siteSettings.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteSettings.location)}`;
  const mapsEmbedUrl = buildMapEmbedUrl(
    siteSettings.googleMapsUrl,
    siteSettings.location,
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("Sending...");
    try {
      await createInquiry(form);
      setForm(initialForm);
      setStatus("Inquiry sent successfully.");
    } catch (err) {
      setStatus(err.response?.data?.error || "Could not submit inquiry.");
    }
  }

  return (
    <PageTransition>
      <StatusToast message={status} onClose={() => setStatus("")} />
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <button
            onClick={() => navigate("/")}
            className="mb-4 rounded-full border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
          >
            Back
          </button>
          <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--accent)]">
            Contact
          </p>
          <h2 className="font-heading text-4xl">
            Book Classes or Place Orders
          </h2>
          <p className="mt-3 text-[color:var(--text-secondary)]">
            Pranjal Boutique offers bridal customization, Aari work, embroidery,
            fabric painting, and exclusive designer finishing. Share your
            requirement and our team will connect with you quickly.
          </p>

          <div className="space-y-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
            <h3 className="font-heading text-2xl text-[#d4af37]">
              Pranjal Boutique Information
            </h3>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                Contact Numbers
              </p>
              <div className="mt-2 space-y-2">
                {siteSettings.contactNumbers.map((number) => (
                  <a
                    key={number}
                    href={`tel:${number.replace(/\s+/g, "")}`}
                    className="flex items-center gap-2 text-[color:var(--text-primary)] transition hover:text-[#d4af37]"
                  >
                    <PhoneIcon />
                    <span>{number}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#2c3150] bg-gradient-to-br from-[#12162f] to-[#0d1126] p-6 text-center shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
              <p className="text-3xl font-bold text-white">Address</p>
              <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f2d16b]" />

              <p className="mx-auto mt-4 max-w-xl text-xl leading-relaxed text-[#f3f4ff]">
                {siteSettings.location}
              </p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-[#3a4167] bg-[#0a0a0a]">
                <iframe
                  title="Boutique location map"
                  src={mapsEmbedUrl}
                  className="h-[240px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <a
                href={mapsLink}
                target="_blank"
                rel="noreferrer"
                className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-[#1d233d] px-8 py-3 text-lg font-semibold text-white transition hover:bg-[#252c4a]"
              >
                <LocationIcon />
                <span>Get Direction On Google Map</span>
              </a>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <img
                  src="/whatsapp-logo.png"
                  alt="WhatsApp"
                  className="h-4 w-4 brightness-0 invert"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.classList.remove(
                      "brightness-0",
                      "invert",
                    );
                    event.currentTarget.src = "/whatsapp-logo.svg";
                  }}
                />
                <span>WhatsApp</span>
              </a>

              <a
                href={instagramLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <img
                  src="/instagram-logo.png"
                  alt="Instagram"
                  className="h-4 w-4"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/instagram-logo.svg";
                  }}
                />
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6"
        >
          <input
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
            placeholder="Customer name"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            required
          />
          <input
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <select
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
            value={form.serviceType}
            onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
          >
            <option>Aari</option>
            <option>Mehendi</option>
            <option>Embroidery</option>
            <option>Classes</option>
          </select>
          <textarea
            className="min-h-28 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
          <button
            type="submit"
            className="rounded-full bg-[color:var(--accent)] px-5 py-2 font-semibold text-[color:var(--accent-contrast)]"
          >
            Send Inquiry
          </button>
        </form>
      </section>
    </PageTransition>
  );
}
