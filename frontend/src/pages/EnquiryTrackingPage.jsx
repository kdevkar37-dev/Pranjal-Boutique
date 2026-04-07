import { useState, useEffect } from "react";
import PageTransition from "../components/PageTransition";
import StatusToast from "../components/StatusToast";
import { getInquiries } from "../api/serviceApi";

const statusConfig = {
  NEW: { icon: "📋", color: "border-gray-500 text-gray-400", bgColor: "from-gray-500/0" },
  PENDING: { icon: "⏳", color: "border-yellow-500 text-yellow-400", bgColor: "from-yellow-500/0" },
  CONTACTED: { icon: "📞", color: "border-blue-500 text-blue-400", bgColor: "from-blue-500/0" },
  CLOSED: { icon: "✓", color: "border-green-500 text-green-400", bgColor: "from-green-500/0" },
};

export default function EnquiryTrackingPage() {
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInquiries();
  }, []);

  async function loadInquiries() {
    try {
      setLoading(true);
      const data = await getInquiries();
      setInquiries(data);
      setFilteredInquiries(data);
      setLoading(false);
    } catch (err) {
      setStatus("❌ Unable to load enquiries");
      setLoading(false);
    }
  }

  function handleSearch(phone) {
    setSearchPhone(phone);
    if (!phone.trim()) {
      setFilteredInquiries(inquiries);
      return;
    }
    const results = inquiries.filter(
      (inquiry) => inquiry.phone.includes(phone) || inquiry.customerName.toLowerCase().includes(phone.toLowerCase())
    );
    setFilteredInquiries(results);
  }

  return (
    <PageTransition>
      <StatusToast message={status} onClose={() => setStatus("")} />
      <section className="space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--accent)]">Track Your</p>
          <h2 className="font-heading text-4xl">Enquiry Status</h2>
          <p className="mt-2 text-[color:var(--text-secondary)]">
            Search for your enquiry using your phone number or name to view status and admin responses.
          </p>
        </div>

        {/* Search Section */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <input
            type="text"
            placeholder="Search by phone number or name..."
            value={searchPhone}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-[color:var(--text-primary)] placeholder-[color:var(--text-secondary)]"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-8 text-center">
            <p className="text-[color:var(--text-secondary)]">Loading your enquiries...</p>
          </div>
        )}

        {/* Results */}
        {!loading && filteredInquiries.length === 0 && (
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-8 text-center">
            <p className="text-[color:var(--text-secondary)]">
              {searchPhone ? "No enquiries found. Try a different search." : "No enquiries found."}
            </p>
          </div>
        )}

        {/* Enquiries List */}
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => {
            const config = statusConfig[inquiry.status] || statusConfig.PENDING;
            return (
              <article
                key={inquiry.id}
                className={`rounded-2xl border border-[color:var(--border)] bg-gradient-to-br ${config.bgColor} bg-[color:var(--card)] p-6`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{inquiry.customerName}</h3>
                    <p className="text-sm text-[color:var(--text-secondary)]">📞 {inquiry.phone}</p>
                  </div>
                  <div className={`rounded-full border ${config.color} px-4 py-2 text-sm font-semibold`}>
                    {config.icon} {inquiry.status}
                  </div>
                </div>

                {/* Service Type */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-full bg-[#d4af37]/20 px-3 py-1 text-xs font-semibold text-[#d4af37]">
                    {inquiry.serviceType}
                  </span>
                  <span className="text-xs text-[color:var(--text-secondary)]">
                    Asked on {new Date(inquiry.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Your Message */}
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-secondary)]">
                    Your Enquiry
                  </p>
                  <div className="rounded-lg bg-[#0a0a0a]/50 p-4">
                    <p className="text-sm leading-relaxed text-[color:var(--text-primary)]">{inquiry.message}</p>
                  </div>
                </div>

                {/* Admin Response */}
                {inquiry.adminResponse ? (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
                    <p className="text-xs font-semibold text-green-400 mb-2">✅ Response from Pranjal Boutique:</p>
                    <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">{inquiry.adminResponse}</p>
                    {inquiry.respondedAt && (
                      <p className="mt-2 text-xs text-[color:var(--text-secondary)]">
                        Responded on {new Date(inquiry.respondedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
                    <p className="text-xs font-semibold text-blue-400 mb-1">⏳ Waiting for Response</p>
                    <p className="text-sm text-[color:var(--text-secondary)]">
                      Our team is reviewing your enquiry and will respond soon.
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </PageTransition>
  );
}
