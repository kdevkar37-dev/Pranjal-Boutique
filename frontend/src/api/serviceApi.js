import api from "./client";

export async function getServices(category) {
  const query = category ? `?category=${category}` : "";
  const { data } = await api.get(`/services${query}`);
  return data;
}

export async function getRentalProducts(section, category) {
  const params = new URLSearchParams();
  if (section) {
    params.set("section", section);
  }
  if (category) {
    params.set("category", category);
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  const { data } = await api.get(`/rental-products${query}`);
  return data;
}

export async function createInquiry(payload) {
  const { data } = await api.post("/services/inquiries", payload);
  return data;
}

export async function getReviews() {
  const { data } = await api.get("/services/reviews");
  return data;
}

export async function createReview(payload) {
  const { data } = await api.post("/services/reviews", payload);
  return data;
}

export async function getReviewAnalytics() {
  const { data } = await api.get("/services/reviews/analytics");
  return data;
}

export async function createService(payload) {
  const { data } = await api.post("/admin/services", payload);
  return data;
}

export async function updateService(id, payload) {
  const { data } = await api.put(`/admin/services/${id}`, payload);
  return data;
}

export async function deleteService(id) {
  await api.delete(`/admin/services/${id}`);
}

export async function getServiceCategoryCounts() {
  const { data } = await api.get("/admin/services/category-counts");
  return data;
}

export async function getAdminRentalProducts(section, category) {
  const params = new URLSearchParams();
  if (section) {
    params.set("section", section);
  }
  if (category) {
    params.set("category", category);
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  const { data } = await api.get(`/admin/rental-products${query}`);
  return data;
}

export async function createRentalProduct(payload) {
  const { data } = await api.post("/admin/rental-products", payload);
  return data;
}

export async function updateRentalProduct(id, payload) {
  const { data } = await api.put(`/admin/rental-products/${id}`, payload);
  return data;
}

export async function deleteRentalProduct(id) {
  await api.delete(`/admin/rental-products/${id}`);
}

export async function getRentalCategoryCounts() {
  const { data } = await api.get("/admin/rental-products/category-counts");
  return data;
}

export async function getInquiries() {
  const { data } = await api.get("/admin/inquiries");
  return data;
}

export async function updateInquiryStatus(id, status) {
  const { data } = await api.put(`/admin/inquiries/${id}/status`, { status });
  return data;
}

export async function respondToInquiry(id, adminResponse) {
  const { data } = await api.put(`/admin/inquiries/${id}/respond`, {
    adminResponse,
  });
  return data;
}

export async function getAdminReviews() {
  const { data } = await api.get("/admin/reviews");
  return data;
}

export async function deleteReview(id) {
  await api.delete(`/admin/reviews/${id}`);
}

export async function getSiteSettings() {
  const { data } = await api.get("/site-settings");
  return data;
}

export async function updateSiteSettings(payload) {
  const { data } = await api.put("/admin/site-settings", payload);
  return data;
}
