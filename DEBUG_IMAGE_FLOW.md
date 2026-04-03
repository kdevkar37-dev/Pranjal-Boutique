# Image Loading Debug Trace

## BACKEND TRACE

### 1. ImageService.uploadImage() - What it RETURNS

**File:** `backend/src/main/java/com/pranjal/boutique/service/ImageService.java`
**Line 70:** `return "uploads/images/" + newFileName;`

**Example output:**

```
Input: User uploads "photo.jpg"
Output: "uploads/images/63ff1a41-1297-49aa-8af2-06e4fbebfbb0.jpg"
```

### 2. AdminController.uploadImage() - What it SENDS to Frontend

**File:** `backend/src/main/java/com/pranjal/boutique/controller/AdminController.java`

```java
String imageUrl = imageService.uploadImage(file);  // Gets: "uploads/images/uuid.jpg"
response.put("imageUrl", imageUrl);  // Sends: {"imageUrl": "uploads/images/uuid.jpg"}
```

**Response JSON sent to frontend:**

```json
{
  "imageUrl": "uploads/images/63ff1a41-1297-49aa-8af2-06e4fbebfbb0.jpg",
  "message": "Image uploaded successfully"
}
```

### 3. ServiceController.getAll() - What it RETURNS to Frontend

**File:** `backend/src/main/java/com/pranjal/boutique/controller/ServiceController.java`

The service is stored in MongoDB with the imageUrl as-is, then returned:

**Response JSON sent to frontend:**

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "Aari Work",
    "category": "AARI",
    "description": "...",
    "imageUrl": "uploads/images/63ff1a41-1297-49aa-8af2-06e4fbebfbb0.jpg"
  }
]
```

**BACKEND SUMMARY:**

- ✓ Uploads return: `"uploads/images/uuid.jpg"`
- ✓ Services return: `"uploads/images/uuid.jpg"`
- ✓ DB stores: `"uploads/images/uuid.jpg"`

---

## FRONTEND TRACE

### 1. serviceApi.js - What it RECEIVES

**File:** `frontend/src/api/serviceApi.js`

```javascript
export async function getServices(category) {
  const query = category ? `?category=${category}` : "";
  const { data } = await api.get(`/services${query}`);
  return data; // Returns array with imageUrl: "uploads/images/uuid.jpg"
}
```

**Data structure received:**

```javascript
[
  {
    id: "507f...",
    title: "Aari Work",
    imageUrl: "uploads/images/63ff1a41-1297-49aa-8af2-06e4fbebfbb0.jpg"  ← This is what we get
  }
]
```

### 2. getImageUrl() Helper - What it PROCESSES

**File:** `frontend/src/utils/imageUrl.js`

```javascript
export const getImageUrl = (imageUrl, bust = false) => {
  if (!imageUrl) return "";

  // Case 1: External URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl; // Return as-is
  }

  // Case 2: Complete path (uploads/images/...)
  if (imageUrl.includes("uploads/images")) {
    const fullUrl = `${API_URL}/${imageUrl}`; // Prepend API_URL
    return bust ? `${fullUrl}?t=${Date.now()}` : fullUrl;
  }

  // Case 3: Just filename
  const normalizedFilename = imageUrl.startsWith("/")
    ? imageUrl.substring(1)
    : imageUrl;
  const fullUrl = `${API_URL}/uploads/images/${normalizedFilename}`;
  return bust ? `${fullUrl}?t=${Date.now()}` : fullUrl;
};
```

**Processing flow:**

```
INPUT: "uploads/images/63ff1a41-1297-49aa-8af2-06e4fbebfbb0.jpg"
       ↓ Check: starts with http? NO
       ↓ Check: includes "uploads/images"? YES
       ↓ Action: `${API_URL}/` + imageUrl
OUTPUT: "http://localhost:8080/uploads/images/63ff1a41-1297-49aa-8af2-06e4fbebfbb0.jpg"
```

### 3. Component Usage - How it DISPLAYS

**Example: ServiceCard.jsx**

```javascript
<img
  src={getImageUrl(service.imageUrl)} // Input: "uploads/images/uuid.jpg"
  alt={service.title} // Helper output: "http://localhost:8080/uploads/images/uuid.jpg"
/>
```

---

## COMPLETE FLOW SUMMARY

```
┌─────────────────────────────────────────────────────────┐
│ BACKEND FLOW                                            │
├─────────────────────────────────────────────────────────┤
│ 1. Admin uploads file                                  │
│    ↓                                                    │
│ 2. ImageService.uploadImage()                          │
│    Saves: backend/uploads/images/uuid.jpg              │
│    Returns: "uploads/images/uuid.jpg"                  │
│    ↓                                                    │
│ 3. AdminController response                            │
│    Sends: {"imageUrl": "uploads/images/uuid.jpg"}      │
│    ↓                                                    │
│ 4. Frontend stores in MongoDB                          │
│    Stores: imageUrl: "uploads/images/uuid.jpg"         │
│    ↓                                                    │
│ 5. ServiceController.getAll()                          │
│    Returns: [{"imageUrl": "uploads/images/uuid.jpg"}]  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ FRONTEND FLOW                                           │
├─────────────────────────────────────────────────────────┤
│ 1. serviceApi.getServices()                            │
│    Receives: "uploads/images/uuid.jpg"                 │
│    ↓                                                    │
│ 2. getImageUrl() helper                                │
│    Input: "uploads/images/uuid.jpg"                    │
│    Detects: includes "uploads/images"? YES             │
│    Constructs: API_URL + "/" + "uploads/images/uuid"   │
│    Output: "http://localhost:8080/uploads/images/uuid" │
│    ↓                                                    │
│ 3. <img src={...} />                                   │
│    Browser requests: GET /uploads/images/uuid.jpg      │
│    ↓                                                    │
│ 4. Browser to Server                                   │
│    Full URL: http://localhost:8080/uploads/images/uuid │
│    ↓                                                    │
│ 5. WebConfig Static Handler                            │
│    Maps: /uploads/** → backend/uploads/images/         │
│    Serves: backend/uploads/images/uuid.jpg ✓           │
│    ↓                                                    │
│ 6. Image loads in browser ✓                            │
└─────────────────────────────────────────────────────────┘
```

---

## POTENTIAL MISMATCH POINTS

### Issue 1: API_URL not set correctly

**Frontend expects:** `http://localhost:8080`
**Check:** `import.meta.env.VITE_API_URL`

### Issue 2: imageUrl in database has inconsistent format

**Some have:** `"uploads/images/uuid.jpg"` ✓
**Some have:** `"uuid.jpg"` ✗
**Some have:** `"https://unsplash.com/..."` ✓

### Issue 3: WebConfig path resolution

**Config:** `uploads/images`
**Running from:** `backend/` folder
**Resolves to:** `backend/uploads/images/` ✓

### Issue 4: Static handler not registered

**Must match:** `/uploads/**` endpoint in frontend requests

---

## VERIFICATION CHECKLIST

- [ ] Backend running from `backend/` folder
- [ ] config `uploads/images` (not `backend/uploads/images`)
- [ ] Files exist in `backend/uploads/images/`
- [ ] API_URL in frontend is `http://localhost:8080`
- [ ] getImageUrl() receives complete path from API
- [ ] Static handler `/uploads/**` is registered
- [ ] Browser requests GET `/uploads/images/filename`
- [ ] WebConfig serves from `backend/uploads/images/`
