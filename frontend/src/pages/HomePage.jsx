import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import PageTransition from "../components/PageTransition";
import { getImageUrl } from "../utils/imageUrl";
import {
  createReview,
  getReviewAnalytics,
  getReviews,
  getServices,
  createInquiry,
  getSiteSettings,
} from "../api/serviceApi";

const serviceCategories = {
  "Aari Work": "AARI",
  Embroidery: "EMBROIDERY",
  "Mehendi Art": "MEHENDI",
  "Fabric Painting": "FABRIC_PAINTING",
  "Flower Jewellery": "FLOWER_JEWELLERY",
  "Custom Design": "CUSTOM_DESIGN",
};

const services = [
  {
    icon: "✨",
    title: "Aari Work",
    description:
      "Hand-finished bridal and couture Aari detailing with elevated threadwork precision.",
  },
  {
    icon: "🧵",
    title: "Embroidery",
    description:
      "Luxury embroidery crafted for statement lehengas, blouses, and reception silhouettes.",
  },
  {
    icon: "🎨",
    title: "Fabric Painting",
    description:
      "Fashion-forward painted motifs curated for contemporary festive and bridal edits.",
  },
  {
    icon: "🎭",
    title: "Mehendi Art",
    description:
      "Intricate modern-traditional mehendi for brides, pre-wedding shoots, and celebrations.",
  },
  {
    icon: "💐",
    title: "Flower Jewellery",
    description:
      "Fresh floral jewelry styling designed for haldi, mehendi, and destination ceremonies.",
  },
  {
    icon: "👗",
    title: "Custom Design",
    description:
      "Personalized bridal customization and design consultation for your dream wedding outfit.",
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

const ownerImageUrl = "/owner-photo.png";
const ownerImageFallbackUrl = "/owner-pranjal.png";

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

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [value];
}

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locationState = useLocation();
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
  const [mobileGalleryIndexByCategory, setMobileGalleryIndexByCategory] =
    useState({});
  const mobileTouchStartXByCategoryRef = useRef({});
  const [siteSettings, setSiteSettings] = useState({
    contactNumbers: ["+91 98765 43210", "+91 99887 76655"],
    location: "Pune, Maharashtra, India",
    googleMapsUrl: "",
  });

  const handleServiceClick = (serviceTitle) => {
    const category = serviceCategories[serviceTitle];
    if (category) {
      navigate(`/service/${category}`, {
        state: { backTarget: "home-gallery" },
      });
    } else {
      // For services without mapping, navigate to gallery
      navigate("/gallery");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(locationState.search);
    const targetSection = params.get("section");
    if (targetSection) {
      setTimeout(() => {
        const element = document.getElementById(targetSection);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 0);
    }
  }, [locationState.search]);

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
        const servicesData = await getServices();
        if (!mounted) {
          return;
        }
        const services = toArray(servicesData);
        const mapped = services
          .filter((service) => service.imageUrl)
          .map((service) => ({
            src: service.imageUrl,
            title: service.title,
            category: service.category || "General",
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

    async function loadSiteSettings() {
      try {
        const data = await getSiteSettings();
        if (!mounted) {
          return;
        }

        setSiteSettings({
          contactNumbers: toArray(
            data?.contactNumbers?.length > 0
              ? data.contactNumbers
              : data?.contactNumber || "+91 98765 43210",
          ),
          location: data?.location || "Pune, Maharashtra, India",
          googleMapsUrl: data?.googleMapsUrl || "",
        });
      } catch {
        if (mounted) {
          setSiteSettings({
            contactNumbers: ["+91 98765 43210", "+91 99887 76655"],
            location: "Pune, Maharashtra, India",
            googleMapsUrl: "",
          });
        }
      }
    }

    loadSiteSettings();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadReviews() {
      try {
        const [reviewData, analyticsData] = await Promise.all([
          getReviews(),
          getReviewAnalytics(),
        ]);
        if (!mounted) {
          return;
        }
        setReviews(toArray(reviewData));
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

  const displayedGallery = useMemo(
    () => (dynamicGallery.length > 0 ? dynamicGallery : galleryImages),
    [dynamicGallery],
  );
  const groupedGalleryEntries = useMemo(() => {
    const groupedGallery = displayedGallery.reduce((acc, image) => {
      const category = (image.category || "Featured").trim();
      if (!acc[category]) {
        acc[category] = [];
      }
      if (acc[category].length < 3) {
        acc[category].push(image);
      }
      return acc;
    }, {});
    return Object.entries(groupedGallery);
  }, [displayedGallery]);
  const whatsappNumber = "919373463181";
  const whatsappLink = useMemo(
    () => `https://wa.me/${whatsappNumber}`,
    [whatsappNumber],
  );
  const instagramLink = "https://www.instagram.com/pranjalsdesigner/";
  const mapsLink = useMemo(
    () =>
      siteSettings.googleMapsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteSettings.location)}`,
    [siteSettings.googleMapsUrl, siteSettings.location],
  );
  const mapsEmbedUrl = useMemo(
    () =>
      buildMapEmbedUrl(siteSettings.googleMapsUrl, siteSettings.location),
    [siteSettings.googleMapsUrl, siteSettings.location],
  );

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getMobileCategoryIndex = (category, imagesLength) => {
    if (!imagesLength) {
      return 0;
    }
    return (mobileGalleryIndexByCategory[category] || 0) % imagesLength;
  };

  const goToPreviousMobileImage = (category, imagesLength) => {
    if (!imagesLength) {
      return;
    }
    setMobileGalleryIndexByCategory((previous) => ({
      ...previous,
      [category]: ((previous[category] || 0) - 1 + imagesLength) % imagesLength,
    }));
  };

  const goToNextMobileImage = (category, imagesLength) => {
    if (!imagesLength) {
      return;
    }
    setMobileGalleryIndexByCategory((previous) => ({
      ...previous,
      [category]: ((previous[category] || 0) + 1) % imagesLength,
    }));
  };

  const goToMobileImage = (category, index) => {
    setMobileGalleryIndexByCategory((previous) => ({
      ...previous,
      [category]: index,
    }));
  };

  const handleMobileGalleryTouchStart = (category, event) => {
    mobileTouchStartXByCategoryRef.current[category] =
      event.touches?.[0]?.clientX ?? null;
  };

  const handleMobileGalleryTouchEnd = (category, imagesLength, event) => {
    const touchStartX = mobileTouchStartXByCategoryRef.current[category];
    const touchEndX = event.changedTouches?.[0]?.clientX ?? null;
    mobileTouchStartXByCategoryRef.current[category] = null;

    if (touchStartX === null || touchEndX === null || imagesLength <= 1) {
      return;
    }

    const swipeThreshold = 40;
    const deltaX = touchStartX - touchEndX;

    if (Math.abs(deltaX) < swipeThreshold) {
      return;
    }

    if (deltaX > 0) {
      goToNextMobileImage(category, imagesLength);
      return;
    }

    goToPreviousMobileImage(category, imagesLength);
  };

  useEffect(() => {
    const autoSlideIntervalMs = 3500;
    const intervalId = window.setInterval(() => {
      setMobileGalleryIndexByCategory((previous) => {
        const next = { ...previous };
        groupedGalleryEntries.forEach(([category, images]) => {
          if (images.length <= 1) {
            return;
          }
          next[category] = ((next[category] || 0) + 1) % images.length;
        });
        return next;
      });
    }, autoSlideIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [groupedGalleryEntries]);

  async function handleReviewSubmit(event) {
    event.preventDefault();
    setIsSubmittingReview(true);
    setReviewStatus("Posting your review...");
    try {
      await createReview(reviewForm);
      const [reviewData, analyticsData] = await Promise.all([
        getReviews(),
        getReviewAnalytics(),
      ]);
      setReviews(toArray(reviewData));
      setReviewAnalytics(analyticsData);
      setReviewForm({ reviewerName: "", message: "", stars: 5 });
      setReviewStatus("Thank you. Your review is now visible.");
    } catch (err) {
      setReviewStatus(
        err.response?.data?.error || "Could not post your review.",
      );
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
      setEnquiryStatus(
        "Thank you! Your inquiry has been sent. We will contact you soon.",
      );
      // Clear success message after 5 seconds
      setTimeout(() => setEnquiryStatus(""), 5000);
    } catch (err) {
      setEnquiryStatus(
        err.response?.data?.error ||
          "Could not send inquiry. Please try again.",
      );
    }
  }

  function renderStars(starCount) {
    return "★".repeat(starCount) + "☆".repeat(5 - starCount);
  }

  return (
    <PageTransition>
      <div className="overflow-x-hidden">
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
            <div className="hero-owner-wrap">
              <div className="hero-owner-ring hero-owner-ring-one" />
              <div className="hero-owner-ring hero-owner-ring-two" />
              <img
                src={ownerImageUrl}
                alt="Owner of Pranjal's Boutique"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = ownerImageFallbackUrl;
                }}
                className="mx-auto h-80 w-auto object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.45)]"
              />
            </div>
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
              background:
                "linear-gradient(90deg, #f5f5f5 0%, #d4af37 50%, #f5f5f5 100%)",
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
      <section id="services" className="bg-[#1a1a1a] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center" data-aos="fade-up">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#d4af37]">
              Our Services
            </p>
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Crafted for Grand Celebrations
            </h2>
            <p className="text-gray-400">
              Premium Aari work, embroidery, and designer services for modern
              brides
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <button
                key={service.title}
                onClick={() => handleServiceClick(service.title)}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="group rounded-2xl border border-[#3a3a3a] bg-gradient-to-br from-[#252525] to-[#1a1a1a] p-8 transition duration-300 hover:-translate-y-2 hover:border-[#d4af37] hover:shadow-2xl cursor-pointer text-center md:text-left"
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
      <section id="gallery" className="bg-[#0a0a0a] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center" data-aos="fade-up">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#d4af37]">
              Gallery
            </p>
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Luxury Boutique Showcase
            </h2>
            <p className="text-gray-400">
              Curated designs and exclusive creations
            </p>
          </div>

          <div className="space-y-10">
            {groupedGalleryEntries.map(([category, images], groupIndex) => (
              <div key={category} className="text-center md:text-left">
                <h3 className="mb-4 text-xl font-semibold uppercase tracking-[0.15em] text-[#d4af37]">
                  {category}
                </h3>

                <div className="md:hidden">
                  {images.length > 0 && (
                    <>
                      <figure
                        data-aos="zoom-in"
                        data-aos-delay={groupIndex * 100}
                        className="group relative h-80 overflow-hidden rounded-2xl border border-[#3a3a3a]"
                        onTouchStart={(event) =>
                          handleMobileGalleryTouchStart(category, event)
                        }
                        onTouchEnd={(event) =>
                          handleMobileGalleryTouchEnd(
                            category,
                            images.length,
                            event,
                          )
                        }
                      >
                        <img
                          src={getImageUrl(
                            images[getMobileCategoryIndex(category, images.length)]
                              .src,
                          )}
                          alt={
                            images[getMobileCategoryIndex(category, images.length)]
                              .title
                          }
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                        <figcaption className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <span className="text-sm font-semibold tracking-wide text-[#d4af37]">
                            {
                              images[
                                getMobileCategoryIndex(category, images.length)
                              ].title
                            }
                          </span>
                        </figcaption>
                      </figure>

                      <div className="mt-3 flex items-center justify-center gap-2">
                        {images.map((image, index) => (
                          <button
                            key={`${category}-dot-${image.src}-${index}`}
                            type="button"
                            onClick={() => goToMobileImage(category, index)}
                            className={`h-2.5 rounded-full transition ${
                              index ===
                              getMobileCategoryIndex(category, images.length)
                                ? "w-8 bg-[#d4af37]"
                                : "w-2.5 bg-[#3a3a3a]"
                            }`}
                            aria-label={`Show image ${index + 1} in ${category}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
                  {images.map((image, index) => (
                    <figure
                      key={`${category}-${image.src}-${index}`}
                      data-aos="zoom-in"
                      data-aos-delay={(groupIndex * 3 + index) * 100}
                      className="group relative h-80 overflow-hidden rounded-2xl border border-[#3a3a3a]"
                    >
                      <img
                        src={getImageUrl(image.src)}
                        alt={image.title}
                        loading="lazy"
                        decoding="async"
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
            <div data-aos="fade-right" className="text-center md:text-left">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#d4af37]">
                Contact
              </p>
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                Let's Design Your Signature Look
              </h2>
              <p className="mb-8 text-gray-400">
                Visit our studio for couture consultations, bridal
                customization, and personalized design sessions.
              </p>

              <div className="mb-6 rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] p-6">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                  Phone
                </p>
                {siteSettings.contactNumbers.map((number) => (
                  <p
                    key={number}
                    className="flex items-center gap-2 text-white"
                  >
                    <PhoneIcon />
                    <span>{number}</span>
                  </p>
                ))}
              </div>

              <div className="mb-8 rounded-[28px] border border-[#2c3150] bg-gradient-to-br from-[#12162f] to-[#0d1126] p-6 text-center shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
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

              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:-translate-y-1 hover:shadow-lg md:inline-flex"
                >
                  <img
                    src="/whatsapp-logo.png"
                    alt="WhatsApp"
                    loading="lazy"
                    decoding="async"
                    className="h-5 w-5 brightness-0 invert"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.classList.remove(
                        "brightness-0",
                        "invert",
                      );
                      event.currentTarget.src = "/whatsapp-logo.svg";
                    }}
                  />
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-6 py-3 font-semibold text-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <img
                    src="/instagram-logo.png"
                    alt="Instagram"
                    loading="lazy"
                    decoding="async"
                    className="h-5 w-5"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/instagram-logo.svg";
                    }}
                  />
                  <span>Follow on Instagram</span>
                </a>
              </div>
            </div>

            <form
              data-aos="fade-left"
              className="space-y-4 text-center md:text-left"
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
                  onChange={(e) =>
                    setEnquiryForm({
                      ...enquiryForm,
                      customerName: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setEnquiryForm({ ...enquiryForm, phone: e.target.value })
                  }
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
                  onChange={(e) =>
                    setEnquiryForm({
                      ...enquiryForm,
                      serviceType: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setEnquiryForm({ ...enquiryForm, message: e.target.value })
                  }
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
                <p
                  className={`mt-2 text-sm ${enquiryStatus.includes("Thank you") ? "text-green-400" : "text-red-400"}`}
                >
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
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-[#d4af37]">
              Reviews
            </p>
            <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Client Love & Ratings
            </h2>
            <p className="text-gray-400">
              Read all reviews, then leave your own with a 1-5 star rating.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#3a3a3a] bg-[#1a1a1a] p-6 lg:col-span-1">
              <h3 className="mb-4 text-xl font-semibold text-[#d4af37]">
                Post Your Review
              </h3>
              <form className="space-y-3" onSubmit={handleReviewSubmit}>
                <input
                  className="w-full rounded-lg border border-[#3a3a3a] bg-[#121212] px-3 py-2 text-white"
                  placeholder="Your name"
                  value={reviewForm.reviewerName}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      reviewerName: e.target.value,
                    })
                  }
                  required
                />
                <textarea
                  className="min-h-24 w-full rounded-lg border border-[#3a3a3a] bg-[#121212] px-3 py-2 text-white"
                  placeholder="Share your experience"
                  value={reviewForm.message}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, message: e.target.value })
                  }
                  required
                />
                <div>
                  <p className="mb-2 text-sm text-gray-300">
                    Choose stars (1-5)
                  </p>
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
                        onClick={() =>
                          setReviewForm({ ...reviewForm, stars: star })
                        }
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
                {reviewStatus && (
                  <p className="text-sm text-gray-400">{reviewStatus}</p>
                )}
              </form>
            </div>

            <div className="rounded-2xl border border-[#3a3a3a] bg-[#1a1a1a] p-6 lg:col-span-2">
              <h3 className="mb-4 text-xl font-semibold text-[#d4af37]">
                Review Analytics
              </h3>
              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#2e2e2e] bg-[#141414] p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Average Rating
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {reviewAnalytics?.averageRating?.toFixed(1) || "0.0"}
                    <span className="ml-1 text-lg text-[#d4af37]">/5</span>
                  </p>
                </div>
                <div className="rounded-xl border border-[#2e2e2e] bg-[#141414] p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    Total Reviews
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {reviewAnalytics?.totalReviews || 0}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewAnalytics?.starDistribution?.[star] || 0;
                  const total = reviewAnalytics?.totalReviews || 0;
                  const percentage = total > 0 ? (count / total) * 100 : 0;

                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-14 text-sm text-[#d4af37]">
                        {star} star
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#2a2a2a]">
                        <div
                          className="h-full bg-[#d4af37]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-gray-300">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#3a3a3a] bg-[#1a1a1a] p-6">
            <h3 className="mb-4 text-xl font-semibold text-[#d4af37]">
              All Reviews
            </h3>
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {reviews.length === 0 && (
                <p className="text-gray-400">
                  No reviews yet. Be the first to review.
                </p>
              )}
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-[#2e2e2e] bg-[#141414] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-white">
                      {review.reviewerName}
                    </p>
                    <p className="text-sm text-[#d4af37]">
                      {renderStars(review.stars)}
                    </p>
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
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl text-white shadow-2xl transition hover:scale-110"
        title="Chat on WhatsApp"
      >
        <img
          src="/whatsapp-logo.png"
          alt="WhatsApp"
          className="h-8 w-8 brightness-0 invert"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.classList.remove("brightness-0", "invert");
            event.currentTarget.src = "/whatsapp-logo.svg";
          }}
        />
      </a>

      {/* FOOTER */}
      <footer className="border-t border-[#3a3a3a] bg-[#0a0a0a] px-4 py-8 text-center text-gray-400">
        <p>&copy; 2026 Pranjal's Boutique. All rights reserved.</p>
        <p className="mt-2 text-sm">Crafted with elegance for modern brides.</p>
      </footer>
      </div>
    </PageTransition>
  );
}
