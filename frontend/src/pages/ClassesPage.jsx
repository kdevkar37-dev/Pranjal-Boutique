import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";

const classes = [
  {
    title: "Aari Mastery",
    details: "Hands-on sessions on motifs, zari usage, frame setup, and bridal blouse finishing.",
  },
  {
    title: "Fabric Painting",
    details: "From brush control to modern festive patterns with durable textile color methods.",
  },
  {
    title: "Mehendi Design",
    details: "Arabic, bridal, and portrait mehendi styles with speed-practice modules.",
  },
];

export default function ClassesPage() {
  const navigate = useNavigate();
  return (
    <PageTransition>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--accent)]">Classes</p>
            <h2 className="font-heading text-4xl">Boutique Training Programs</h2>
          </div>
          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-[#d4af37] px-4 py-2 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
          >
            ← Back to Home
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {classes.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5"
            >
              <h3 className="font-heading text-2xl">{item.title}</h3>
              <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{item.details}</p>
            </article>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
