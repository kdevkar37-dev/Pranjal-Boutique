import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import { createInquiry } from "../api/serviceApi";

const initialForm = {
  customerName: "",
  phone: "",
  serviceType: "Aari",
  message: "",
};

export default function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");

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
      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <button
            onClick={() => navigate("/")}
            className="mb-4 rounded-full border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
          >
            ← Back
          </button>
          <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--accent)]">Contact</p>
          <h2 className="font-heading text-4xl">Book Classes or Place Orders</h2>
          <p className="mt-3 text-[color:var(--text-secondary)]">
            Send your details and we will contact you for classes, customization, or rental bookings.
          </p>
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
          {status && <p className="text-sm text-[color:var(--text-secondary)]">{status}</p>}
        </form>
      </section>
    </PageTransition>
  );
}
