# Image URL Flow Documentation

## Summary

All images in Pranjal-Boutique use the following unified flow:

## File Structure

```
backend/
├── uploads/
│   └── images/
│       ├── a1b2c3d4-e5f6-g7h8.jpg
│       ├── b2c3d4e5-f6g7-h8i9.jpg
│       └── ...

frontend/
└── src/
    ├── utils/
    │   └── imageUrl.js  ← Shared helper for ALL components
    ├── components/
    │   └── ServiceCard.jsx  (uses imageUrl.js)
    └── pages/
        ├── AdminDashboardPage.jsx  (uses imageUrl.js)
        ├── AdminServicesPage.jsx   (uses imageUrl.js)
        ├── ServiceDetailPage.jsx   (uses imageUrl.js)
        └── HomePage.jsx
```

## Image URL Flow

### 1. Upload Phase (Admin)

```
File Input → MultipartFile
   ↓
POST /api/admin/images/upload
   ↓
ImageService.uploadImage():
  - Validate: size, type, extension
  - Save: backend/uploads/images/{UUID}.jpg
  - Return: "uploads/images/{UUID}.jpg"
   ↓
Response: {"imageUrl": "uploads/images/{UUID}.jpg"}
```

### 2. Storage Phase (Database)

```
Service Creation:
  POST /api/admin/services
  Body: {"imageUrl": "uploads/images/{UUID}.jpg", ...}
   ↓
Backend → MongoDB:
  Stores: {imageUrl: "uploads/images/{UUID}.jpg", ...}
```

### 3. Retrieval Phase (Frontend)

```
Service Fetch:
  GET /api/services
   ↓
Backend Response: {imageUrl: "uploads/images/{UUID}.jpg", ...}
   ↓
Frontend Receives: imageUrl = "uploads/images/{UUID}.jpg"
```

### 4. Display Phase (Component)

```
Component Usage:
  <img src={getImageUrl(service.imageUrl)} />
   ↓
getImageUrl() Helper (shared utility):
  Input: "uploads/images/{UUID}.jpg"
  Check: Includes 'uploads/images'? YES
  Output: "http://localhost:8080/uploads/images/{UUID}.jpg"
   ↓
Browser Request:
  GET http://localhost:8080/uploads/images/{UUID}.jpg
   ↓
WebConfig Static Handler:
  Maps: /uploads/** → backend/uploads/images/
  Serves: {file content}
   ↓
Display: Image rendered in browser ✅
```

## URL Format at Each Step

| Step               | Format        | Example                                             |
| ------------------ | ------------- | --------------------------------------------------- |
| Database           | Relative path | `uploads/images/a1b2c3d4.jpg`                       |
| API Response       | Relative path | `uploads/images/a1b2c3d4.jpg`                       |
| getImageUrl Input  | Relative path | `uploads/images/a1b2c3d4.jpg`                       |
| getImageUrl Output | Full API URL  | `http://localhost:8080/uploads/images/a1b2c3d4.jpg` |
| Browser Request    | Full API URL  | `http://localhost:8080/uploads/images/a1b2c3d4.jpg` |
| Backend Serves     | Physical file | `backend/uploads/images/a1b2c3d4.jpg`               |

## Helper Function: getImageUrl()

**Location:** `frontend/src/utils/imageUrl.js`

**Usage:**

```javascript
import { getImageUrl } from "../utils/imageUrl";

// Basic usage (public display)
<img src={getImageUrl(service.imageUrl)} alt={service.title} />;

// With cache-busting (admin editing)
setPreviewImage(getImageUrl(service.imageUrl, true));
// Appends: ?t=1680520800000 (forces fresh load from server)
```

**Handles:**

- ✅ External URLs (http/https) - returns as-is
- ✅ Full path (uploads/images/...) - prepends API_URL
- ✅ Legacy filename only - converts to full path
- ✅ Cache-busting for admin edits

## Environment Configuration

**Frontend (.env or .env.local):**

```env
VITE_API_URL=http://localhost:8080  # Defaults to this if not set
VITE_API_BASE_URL=/api               # API endpoint prefix
VITE_WHATSAPP_NUMBER=919999999999    # WhatsApp integration
```

**Backend (application.yml):**

```yaml
app:
  upload:
    dir: ${UPLOAD_DIR:backend/uploads/images}
  cors:
    allowed-origins: http://localhost:3000
```

## Components Using Images

| Component          | File                                        | Usage                              |
| ------------------ | ------------------------------------------- | ---------------------------------- |
| ServiceCard        | `frontend/src/components/ServiceCard.jsx`   | Display service cards with images  |
| AdminDashboardPage | `frontend/src/pages/AdminDashboardPage.jsx` | Upload, edit, preview images       |
| AdminServicesPage  | `frontend/src/pages/AdminServicesPage.jsx`  | Manage services with images        |
| ServiceDetailPage  | `frontend/src/pages/ServiceDetailPage.jsx`  | Display service details with image |

All components import `getImageUrl` from `frontend/src/utils/imageUrl.js`

## Verification Checklist

- ✅ Images saved to: `backend/uploads/images/`
- ✅ Database stores: `uploads/images/{UUID}.jpg`
- ✅ API returns: `uploads/images/{UUID}.jpg`
- ✅ Frontend helper converts to: `http://localhost:8080/uploads/images/{UUID}.jpg`
- ✅ WebConfig serves from: `backend/uploads/images/`
- ✅ Static handler: `/uploads/**` enabled
- ✅ Cache-busting: Optional, used in admin editing
- ✅ Code duplication: Eliminated (single shared utility)

## Testing

### Test 1: Upload Image

1. Go to Admin Dashboard
2. Click "Add New Service"
3. Upload an image
4. Verify: Image appears in preview
5. Submit service
6. Verify: Image appears in service list

### Test 2: Edit Service

1. Click edit on existing service
2. Verify: Image preview shows
3. Upload new image
4. Verify: Click refresh, new image shows

### Test 3: Public Display

1. Navigate to home page
2. View service cards
3. Verify: Images display correctly

### Test 4: Cache-Busting

1. Edit service with new image upload
2. Check browser Network tab
3. Verify: URL includes `?t=timestamp` parameter
