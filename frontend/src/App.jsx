import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen";

const HomePage = lazy(() => import("./pages/HomePage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const RentalPage = lazy(() => import("./pages/RentalPage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const ClassesPage = lazy(() => import("./pages/ClassesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const EnquiryTrackingPage = lazy(() => import("./pages/EnquiryTrackingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const OAuth2SuccessPage = lazy(() => import("./pages/OAuth2SuccessPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminRentalProductsPage = lazy(
  () => import("./pages/AdminRentalProductsPage"),
);

export default function App() {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 3500);

    return () => {
      window.clearTimeout(splashTimer);
    };
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg)] font-body text-[color:var(--text-primary)]">
      <Header />
      <main className="min-h-[calc(100vh-80px)] w-full px-4 pb-16 pt-20 md:px-8">
        <AnimatePresence mode="wait">
          <Suspense
            fallback={
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 text-[color:var(--text-secondary)]">
                Loading page...
              </div>
            }
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/rental" element={<RentalPage />} />
              <Route path="/service/:category" element={<ServiceDetailPage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/track-enquiry" element={<EnquiryTrackingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/oauth2/success" element={<OAuth2SuccessPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/rental-products"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminRentalProductsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
    </div>
  );
}
