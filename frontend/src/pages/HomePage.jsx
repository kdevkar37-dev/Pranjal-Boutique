import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import PageTransition from "../components/PageTransition";
import { createReview, getReviewAnalytics, getReviews, getServices, createInquiry } from "../api/serviceApi";
import { useState } from "react";

const serviceCategories = {
  "Aari Work": "AARI",
  "Embroidery": "EMBROIDERY",
  "Mehendi Art": "MEHENDI",
  "Fabric Painting": "FABRIC_PAINTING",
  "Flower Jewellery": "FLOWER_JEWELLERY",
  "Custom Design": "CUSTOM_DESIGN",
};

const services = [
  {
    icon: "✨",
    title: "Aari Work",
    description: "Hand-finished bridal and couture Aari detailing with elevated threadwork precision.",
  },
  {
    icon: "🧵",
    title: "Embroidery",
    description: "Luxury embroidery crafted for statement lehengas, blouses, and reception silhouettes.",
  },
  {
    icon: "🎨",
    title: "Fabric Painting",
    description: "Fashion-forward painted motifs curated for contemporary festive and bridal edits.",
  },
  {
    icon: "🎭",
    title: "Mehendi Art",
    description: "Intricate modern-traditional mehendi for brides, pre-wedding shoots, and celebrations.",
  },
  {
    icon: "💐",
    title: "Flower Jewellery",
    description: "Fresh floral jewelry styling designed for haldi, mehendi, and destination ceremonies.",
  },
  {
    icon: "👗",
    title: "Custom Design",
    description: "Personalized bridal customization and design consultation for your dream wedding outfit.",
  },
];

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1610189013299-3644cd7c61cd?auto=format&fit=crop&w=800&q=80",
    title: "Bridal Couture",
  },
  {
    src: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    title: "Aari Blouse Design",
  },
  {
    src: "https://images.unsplash.com/photo-1604480133435-25b86862d276?auto=format&fit=crop&w=800&q=80",
    title: "Luxury Embroidery",
  },
  {
    src: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80",
    title: "Floral Styling",
  },
  {
    src: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=800&q=80",
    title: "Runway Edit",
  },
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    title: "Classic Design",
  },
];

const ownerImageUrl = "/owner-pranjal.png";

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dynamicGallery, setDynamicGallery] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewAnalytics, setReviewAnalytics] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    reviewerName: "",
    message: "",
    stars: 5,
  });
  const [enquiryForm, setEnquiryForm] = useState({
    customerName: "",
    phone: "",
    serviceType: "Aari Work",
    message: "",
  });
  const [enquiryStatus, setEnquiryStatus] = useState("");

  const handleServiceClick = (serviceTitle) => {
    const category = serviceCategories[serviceTitle];
    if (category) {
      navigate(`/service/${category}`);
    } else {
      // For services without mapping, navigate to gallery
      navigate("/gallery");
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-out-cubic",
      once: true,
      offset: 100,
    });
    AOS.refresh();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadGallery() {
      try {
        const services = await getServices();
        if (!mounted) {
          return;
        }
        const mapped = services
          .filter((service) => service.imageUrl)
          .map((service) => ({
            src: service.imageUrl,
            title: service.title,
          }));
        setDynamicGallery(mapped);
      } catch {
        if (mounted) {
          setDynamicGallery([]);
        }
      }
    }

    loadGallery();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadReviews() {
      try {
        const [reviewData, analyticsData] = await Promise.all([getReviews(), getReviewAnalytics()]);
        if (!mounted) {
          return;
        }
        setReviews(reviewData);
        setReviewAnalytics(analyticsData);
      } catch {
        if (!mounted) {
          return;
        }
        setReviewStatus("Could not load reviews right now.");
      }
    }

    loadReviews();

    return () => {
      mounted = false;
    };
  }, []);

  const displayedGallery = dynamicGallery.length > 0 ? dynamicGallery : galleryImages;

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  async function handleReviewSubmit(event) {
    event.preventDefault();
    setIsSubmittingReview(true);
    setReviewStatus("Posting your review...");
    try {
      await createReview(reviewForm);
      const [reviewData, analyticsData] = await Promise.all([getReviews(), getReviewAnalytics()]);
      setReviews(reviewData);
      setReviewAnalytics(analyticsData);
      setReviewForm({ reviewerName: "", message: "", stars: 5 });
      setReviewStatus("Thank you. Your review is now visible.");
    } catch (err) {
      setReviewStatus(err.response?.data?.error || "Could not post your review.");
    } finally {
      setIsSubmittingReview(false);
    }
  }

  async function handleEnquirySubmit(event) {
    event.preventDefault();
    setEnquiryStatus("Sending your inquiry...");
    try {
      await createInquiry(enquiryForm);
      setEnquiryForm({
        customerName: "",
        phone: "",
        serviceType: "Aari Work",
        message: "",
      });
      setEnquiryStatus("Thank you! Your inquiry has been sent. We will contact you soon.");
      // Clear success message after 5 seconds
      setTimeout(() => setEnquiryStatus(""), 5000);
    } catch (err) {
      setEnquiryStatus(err.response?.data?.error || "Could not send inquiry. Please try again.");
    }
  }

  function renderStars(starCount) {
    return "★".repeat(starCount) + "☆".repeat(5 - starCount);
  }

  return (
    <PageTransition>
      {/* HERO SECTION */}
      <section
        id="hero"
        className="relative min-h-[calc(100vh-80px)] w-full bg-gradient-to-br from-[#1a0a0f] via-[#0a0a0a] to-[#0f0f1a] overflow-hidden"
      >
        {/* Background Glow */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(139, 21, 56, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(212, 175, 55, 0.2) 0%, transparent 50%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex h-full min-h-screen flex-col items-center justify-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -120 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-6 w-full"
          >
            <img
              src={ownerImageUrl}
              alt="Owner of Pranjal's Boutique"
              className="mx-auto h-80 w-auto object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.45)]"
            />
          </motion.div>

          <p
            className="mb-4 text-xs uppercase tracking-[0.3em] text-[#d4af37]"
            data-aos="fade-down"
          >
            Pranjal's Boutique
          </p>
          <h1
            className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl"
            data-aos="fade-up"
            data-aos-delay="100"
            style={{
              background: "linear-gradient(90deg, #f5f5f5 0%, #d4af37 50%, #f5f5f5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Luxury Designer Boutique
          </h1>
          <p
            className="mb-8 max-w-2xl text-lg text-gray-300 md:text-xl"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Professional Aari Work & Bridal Design
          </p>
          <div
            className="flex flex-wrap justify-center gap-4"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <button
              onClick={() => scrollToSection("contact")}
              className="rounded-full bg-gradient-to-r from-[#d4af37] to-[#e8c458] px-8 py-3 font-semibold text-black transition hover:-translate-y-1 hover:shadow-2xl"
            >
              Book Consultation
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="rounded-full border-2 border-[#d4af37] px-8 py-3 font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
            >
              Explore Services
            </button>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section
        id="services"
        className="bg-[#1a1a1a] px-4 py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center" data-aos="fade-up">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#d4af37]">
              Our Services
            </p>
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Crafted for Grand Celebrations
            </h2>
            <p className="text-gray-400">
              Premium Aari work, embroidery, and designer services for modern brides
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <button
                key={service.title}
                onClick={() => handleServiceClick(service.title)}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="group rounded-2xl border border-[#3a3a3a] bg-gradient-to-br from-[#252525] to-[#1a1a1a] p-8 transition duration-300 hover:-translate-y-2 hover:border-[#d4af37] hover:shadow-2xl cursor-pointer text-left"
              >
                <div className="mb-4 text-4xl">{service.icon}</div>
                <h3 className="mb-3 text-xl font-semibold text-[#d4af37]">
                  {service.title}
                </h3>
                <p className="text-gray-400">{service.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section
        id="gallery"
        className="bg-[#0a0a0a] px-4 py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center" data-aos="fade-up">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#d4af37]">
              Gallery
            </p>
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Luxury Boutique Showcase
            </h2>
            <p className="text-gray-400">Curated designs and exclusive creations</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedGallery.map((image, index) => (
              <figure
                key={image.src}
                data-aos="zoom-in"
                data-aos-delay={index * 100}
                className="group relative h-80 overflow-hidden rounded-2xl border border-[#3a3a3a]"
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                <figcaption className="absolute bottom-0 left-0 right-0 p-6 text-white opacity-0 transition duration-300 group-hover:opacity-100">
                  <span className="text-sm font-semibold tracking-wide text-[#d4af37]">
                    {image.title}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section
        id="contact"
        className="bg-gradient-to-br from-[#2a0f18] via-[#1a0a0f] to-[#0a0a0a] px-4 py-16 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-2">
            <div data-aos="fade-right">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#d4af37]">
                Contact
              </p>
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                Let's Design Your Signature Look
              </h2>
              <p className="mb-8 text-gray-400">
                Visit our studio for couture consultations, bridal customization, and
                personalized design sessions.
              </p>

              <div className="mb-6 rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] p-6">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                  Phone
                </p>
                <p className="mb-2 text-white">+91 98765 43210</p>
                <p className="text-white">+91 99887 76655</p>
              </div>

              <div className="mb-8 rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] p-6">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                  Location
                </p>
                <p className="text-white">Pune, Maharashtra, India</p>
              </div>

              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                💬 Chat on WhatsApp
              </a>
            </div>

            <form
              data-aos="fade-left"
              className="space-y-4"
              onSubmit={handleEnquirySubmit}
            >
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.1em] text-[#d4af37]">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={enquiryForm.customerName}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, customerName: e.target.value })}
                  className="w-full rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] px-4 py-3 text-white transition focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.1em] text-[#d4af37]">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                  className="w-full rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] px-4 py-3 text-white transition focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.1em] text-[#d4af37]">
                  Service Type
                </label>
                <select 
                  value={enquiryForm.serviceType}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, serviceType: e.target.value })}
                  className="w-full rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] px-4 py-3 text-white transition focus:border-[#d4af37] focus:outline-none"
                >
                  <option>Aari Work</option>
                  <option>Embroidery</option>
                  <option>Fabric Painting</option>
                  <option>Mehendi Art</option>
                  <option>Flower Jewellery</option>
                  <option>Custom Design</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.1em] text-[#d4af37]">
                  Message
                </label>
                <textarea
                  placeholder="Tell us about your design vision..."
                  rows={5}
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                  className="w-full rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] px-4 py-3 text-white transition focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#e8c458] px-8 py-3 font-semibold text-black transition hover:-translate-y-1 hover:shadow-2xl"
              >
                Send Inquiry
              </button>
              {enquiryStatus && (
                <p className={`mt-2 text-sm ${enquiryStatus.includes("Thank you") ? "text-green-400" : "text-red-400"}`}>
                  {enquiryStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section id="reviews" className="bg-[#111111] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="text-center" data-aos="fade-up">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#d4af37]">Reviews</p>
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">Client Love & Ratings</h2>
            <p className="text-gray-400">Read all reviews, then leave your own with a 1-5 star rating.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#3a3a3a] bg-[#1a1a1a] p-6 lg:col-span-1">
              <h3 className="mb-4 text-xl font-semibold text-[#d4af37]">Post Your Review</h3>
              <form className="space-y-3" onSubmit={handleReviewSubmit}>
                <input
                  className="w-full rounded-lg border border-[#3a3a3a] bg-[#121212] px-3 py-2 text-white"
                  placeholder="Your name"
                  value={reviewForm.reviewerName}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
                  required
                />
                <textarea
                  className="min-h-24 w-full rounded-lg border border-[#3a3a3a] bg-[#121212] px-3 py-2 text-white"
                  placeholder="Share your experience"
                  value={reviewForm.message}
                  onChange={(e) => setReviewForm({ ...reviewForm, message: e.target.value })}
                  required
                />
                <div>
                  <p className="mb-2 text-sm text-gray-300">Choose stars (1-5)</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`rounded-md px-2 py-1 text-lg transition ${
                          reviewForm.stars >= star
                            ? "bg-[#d4af37] text-black"
                            : "border border-[#3a3a3a] text-[#d4af37]"
                        }`}
                        onClick={() => setReviewForm({ ...reviewForm, stars: star })}
                        aria-label={`Select ${star} star rating`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#e8c458] px-5 py-2 font-semibold text-black disabled:opacity-60"
                >
                  {isSubmittingReview ? "Posting..." : "Submit Review"}
                </button>
                {reviewStatus && <p className="text-sm text-gray-400">{reviewStatus}</p>}
              </form>
            </div>

            <div className="rounded-2xl border border-[#3a3a3a] bg-[#1a1a1a] p-6 lg:col-span-2">
              <h3 className="mb-4 text-xl font-semibold text-[#d4af37]">Review Analytics</h3>
              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#2e2e2e] bg-[#141414] p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-400">Average Rating</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {reviewAnalytics?.averageRating?.toFixed(1) || "0.0"}
                    <span className="ml-1 text-lg text-[#d4af37]">/5</span>
                  </p>
                </div>
                <div className="rounded-xl border border-[#2e2e2e] bg-[#141414] p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-400">Total Reviews</p>
                  <p className="mt-2 text-3xl font-bold text-white">{reviewAnalytics?.totalReviews || 0}</p>
                </div>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewAnalytics?.starDistribution?.[star] || 0;
                  const total = reviewAnalytics?.totalReviews || 0;
                  const percentage = total > 0 ? (count / total) * 100 : 0;

                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-14 text-sm text-[#d4af37]">{star} star</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#2a2a2a]">
                        <div className="h-full bg-[#d4af37]" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs text-gray-300">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#3a3a3a] bg-[#1a1a1a] p-6">
            <h3 className="mb-4 text-xl font-semibold text-[#d4af37]">All Reviews</h3>
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {reviews.length === 0 && <p className="text-gray-400">No reviews yet. Be the first to review.</p>}
              {reviews.map((review) => (
                <article key={review.id} className="rounded-xl border border-[#2e2e2e] bg-[#141414] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-white">{review.reviewerName}</p>
                    <p className="text-sm text-[#d4af37]">{renderStars(review.stars)}</p>
                  </div>
                  <p className="mt-2 text-sm text-gray-300">{review.message}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING WHATSAPP */}
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-2xl transition hover:scale-110"
        title="Chat on WhatsApp"
      >
        💬
      </a>

      {/* FOOTER */}
      <footer className="border-t border-[#3a3a3a] bg-[#0a0a0a] px-4 py-8 text-center text-gray-400">
        <p>&copy; 2026 Pranjal's Boutique. All rights reserved.</p>
        <p className="mt-2 text-sm">Crafted with elegance for modern brides.</p>
      </footer>
    </PageTransition>
  );
}
