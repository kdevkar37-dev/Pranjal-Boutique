## PRANJAL'S BOUTIQUE - ROUTING MAP & NAVIGATION FLOW

### Complete Route Structure

```
/                          → HomePage
├─ Header links to: /gallery, /classes, /contact
├─ 6 Service Cards → /service/{category} (AARI, EMBROIDERY, MEHENDI, FABRIC_PAINTING, FLOWER_JEWELLERY, CUSTOM_DESIGN)
├─ "Book Consultation" → Scrolls to #contact section
├─ "Explore Services" → Scrolls to #services section
└─ Contact form on page

/gallery                   → GalleryPage
├─ Back button → /
├─ Service Cards → /service/{category}
└─ Header links available

/service/:category         → ServiceDetailPage
├─ Back button → /gallery
├─ Main image display
├─ Thumbnail gallery (6 cards)
│  └─ Each thumbnail switches main image
└─ Header links available

/classes                   → ClassesPage
├─ Back button → /
├─ Class information cards
└─ Header links available

/contact                   → ContactPage
├─ Back button → /
├─ Contact form
└─ Header links available

/login                     → LoginPage
├─ On successful login:
│  ├─ Admin users → /admin
│  └─ Regular users → /
└─ No back button (modal behavior)

/admin                     → AdminDashboardPage (Protected)
├─ Service Management section:
│  ├─ 6 Category tabs (all types)
│  ├─ Create new services
│  ├─ Edit services
│  └─ Delete services
├─ Inquiries section
├─ Review Analytics section
└─ Logout button in header → / (with redirect)

/oauth2/success            → OAuth2SuccessPage
└─ Handles OAuth2 callback
```

### Navigation Flows

**Flow 1: Home → Service Detail → Gallery → Home**
```
/ (home page)
  ↓ [Click service card]
/service/AARI
  ↓ [Back button]
/gallery
  ↓ [Back to Home button]
/
```

**Flow 2: Classes → Home → Gallery → Service Detail**
```
/classes
  ↓ [Back button]
/
  ↓ [Gallery link in header]
/gallery
  ↓ [Click service card]
/service/EMBROIDERY
  ↓ [Back button]
/gallery
```

**Flow 3: Admin Login & Management**
```
/ (home page, not logged in)
  ↓ [Click admin/login header]
/login
  ↓ [Enter admin credentials]
/admin (dashboard)
  ↓ [Manage services by category]
/admin (stay on dashboard)
  ↓ [Logout button]
/
```

**Flow 4: Contact Form**
```
/ (home page)
  ↓ [Scroll to contact or link in header]
/contact
  ↓ [Fill and submit form]
/contact (stays, shows success)
  ↓ [Back button]
/
```

### Header Navigation (Available on All Pages)
- Logo (PRANJAL'S) → /
- Home → /
- Gallery → /gallery
- Classes → /classes
- Contact → /contact
- Login (if not logged in, only on /admin) → /login
- Logout (if logged in) → / + clears session
- User profile (if logged in) → Display name and avatar

### Back Button Summary
| Page | Back Button | Goes To |
|------|------------|---------|
| / (Home) | N/A | N/A |
| /gallery | ← Back to Home | / |
| /service/:category | ← Back | /gallery |
| /classes | ← Back to Home | / |
| /contact | ← Back | / |
| /login | N/A | Auto-redirects after login |
| /admin | N/A | Main dashboard (logout via header) |

### Key Points Confirmed ✓

✅ All 6 service categories fully supported (AARI, EMBROIDERY, MEHENDI, FABRIC_PAINTING, FLOWER_JEWELLERY, CUSTOM_DESIGN)
✅ Service cards navigation works with normalized URL case (always uppercase in URL)
✅ Back buttons present on secondary pages (Gallery, Classes, Contact)
✅ ServiceDetailPage back goes to /gallery (source page)
✅ Gallery back goes to / (home page)
✅ Header provides consistent navigation across all pages
✅ Login redirects admins to /admin, regular users to /
✅ Logout clears session and returns to /
✅ Admin dashboard protected with ProtectedRoute
✅ Service thumbnails in detail page switch main image without navigation
✅ All pages use PageTransition for smooth animations
