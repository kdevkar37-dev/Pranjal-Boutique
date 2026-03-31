import { motion } from "framer-motion";

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";

export default function ServiceCard({ service, index = 0 }) {
  const message = encodeURIComponent(
    `Hello Pranjal, I saw the ${service.title} on your website and want to ask about classes.`
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="group overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-aura"
    >
      <img
        src={service.imageUrl}
        alt={service.title}
        className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="space-y-3 p-4">
        <p className="text-xs uppercase tracking-widest text-[color:var(--accent)]">{service.category}</p>
        <h3 className="font-heading text-2xl text-[color:var(--text-primary)]">{service.title}</h3>
        <p className="text-sm text-[color:var(--text-secondary)]">{service.description}</p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent-contrast)]"
        >
          Inquire on WhatsApp
        </a>
      </div>
    </motion.article>
  );
}
