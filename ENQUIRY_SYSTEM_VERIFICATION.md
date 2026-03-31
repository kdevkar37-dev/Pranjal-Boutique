## ENQUIRY SYSTEM - COMPLETE VERIFICATION ✓

### From User Submission to Admin View

#### Step 1: User Submits Enquiry
**Location:** Home Page (/) - Contact Section OR `/contact` page

**Form Fields (User fills on home page):**
- Name (customerName)
- Phone (phone)
- Service Type (serviceType) - From dropdown
- Message (message)

**Service Options Available:**
- Aari Work
- Embroidery
- Fabric Painting
- Mehendi Art
- Flower Jewellery
- Custom Design

**Submission Process:**
1. User fills form with their details
2. User clicks "Send Inquiry" button
3. Frontend calls `createInquiry(enquiryForm)` API
4. Data sent to backend: `POST /api/services/inquiries`
5. Success message shown: "Thank you! Your inquiry has been sent. We will contact you soon."
6. Form automatically clears for next enquiry

**Error Handling:**
- If submission fails: Error message displayed to user
- User can retry the submission

---

#### Step 2: Backend Receives & Stores Enquiry
**Backend Endpoint:** `POST /api/services/inquiries`

**InquiryRequest DTO Fields:**
```java
{
  "customerName": "string",
  "phone": "string",
  "serviceType": "string",
  "message": "string"
}
```

**Database Storage:** MongoDB Collection `inquiries`

**Inquiry Fields Stored:**
- id (auto-generated)
- customerName
- phone
- serviceType
- message
- status (default: "PENDING")
- createdAt (timestamp)

---

#### Step 3: Admin Receives & Views Enquiries
**Location:** Admin Dashboard (`/admin`)

**Authentication:** Admin login required (ROLE_ADMIN)

**Enquiries Section Shows:**
1. **List of all submitted enquiries** displayed as cards
2. **Each enquiry card displays:**
   - Customer Name + Phone Number
   - Service Type (the service they're interested in)
   - Full Message text
   - Current Status (PENDING, CONTACTED, CLOSED)

**Admin Actions Available:**
- **Mark Contacted** - Updates status to CONTACTED when admin has reached out
- **Mark Closed** - Updates status to CLOSED when inquiry is resolved
- **View Details** - Full message and customer info visible

**Status Workflow:**
```
User Submits Enquiry
        ↓
Status: PENDING (default)
        ↓
Admin reviews & contacts customer
        ↓
Status: CONTACTED
        ↓
Issue resolved (order placed, classes booked, etc.)
        ↓
Status: CLOSED
```

---

### Complete Flow Diagram

```
HOME PAGE (/)
├─ Contact Section visible
├─ User fills form:
│  ├─ Name
│  ├─ Phone
│  ├─ Service Type (dropdown with 6 options)
│  └─ Message
└─ User clicks "Send Inquiry"
        ↓
FRONTEND CALL
├─ Validates form fields
├─ Calls createInquiry(form)
└─ Sends POST /api/services/inquiries
        ↓
BACKEND PROCESSING
├─ Receives at InquiryController
├─ Creates new Inquiry document
├─ Stores in MongoDB
└─ Returns success response
        ↓
SUCCESS MESSAGE
├─ Shows: "Thank you! Your inquiry has been sent..."
├─ Form clears
└─ User can submit another enquiry
        ↓
ADMIN DASHBOARD (/admin)
├─ Admin logs in (ROLE_ADMIN)
├─ Navigates to "Orders / Class Inquiries" section
├─ Sees list of all pending enquiries
├─ Can:
│  ├─ Read customer details & message
│  ├─ Contact customer via phone
│  ├─ Mark as CONTACTED
│  └─ Mark as CLOSED when resolved
└─ Status persists for future reference
```

---

### API Endpoints Involved

**User Submission:**
```
POST /api/services/inquiries
Headers: Content-Type: application/json
Body: {
  "customerName": "John Doe",
  "phone": "+91 98765 43210",
  "serviceType": "Aari Work",
  "message": "Looking for bridal aari work"
}
Response: 201 Created + Inquiry object
```

**Admin Retrieval:**
```
GET /api/admin/inquiries
Headers: Authorization: Bearer {token}
Response: 200 OK + Array of all inquiries
```

**Admin Update Status:**
```
PUT /api/admin/inquiries/{id}/status
Headers: Authorization: Bearer {token}
Body: { "status": "CONTACTED" | "CLOSED" }
Response: 200 OK + Updated inquiry
```

---

### System Components

**Frontend:**
- ✅ HomePage.jsx - Contact form with enquiry state
- ✅ ContactPage.jsx - Standalone contact form (alternative)
- ✅ AdminDashboardPage.jsx - Enquiry viewing & status management
- ✅ authApi.js - API function `createInquiry()`

**Backend:**
- ✅ InquiryController.java - Endpoint: POST /api/services/inquiries
- ✅ AdminController.java - Endpoints: GET & PUT for inquiries
- ✅ InquiryService.java - Business logic
- ✅ InquiryRepository.java - Database operations
- ✅ Inquiry.java - Model/Entity

**Database:**
- ✅ MongoDB collection: inquiries
- ✅ Stores all customer enquiries with timestamps

---

### Verification Checklist ✓

✅ Home page has enquiry form
✅ Form submits data to backend API
✅ Backend stores enquiries in database
✅ Admin dashboard loads all enquiries
✅ Admin can view customer details & messages
✅ Admin can update enquiry status
✅ Status updates persist in database
✅ User gets success/error feedback
✅ Form clears after successful submission
✅ All 6 service types available in dropdown
✅ Phone number captured for admin contact

---

### Testing the System

**User Side:**
1. Go to home page (/)
2. Scroll to "Contact" section or click "Book Consultation"
3. Fill in form with:
   - Name: "John Doe"
   - Phone: "+91 98765 43210"
   - Service Type: "Aari Work"
   - Message: "I need help with aari design"
4. Click "Send Inquiry"
5. See success message
6. Form clears

**Admin Side:**
1. Go to /admin (login with admin credentials)
2. Scroll to "Orders / Class Inquiries" section
3. See the enquiry from John Doe
4. View all details (name, phone, service type, message)
5. Click "Mark Contacted" to update status
6. See status changed to "CONTACTED"
7. Later, click "Mark Closed" when resolved

---

### Summary

The enquiry system is fully integrated:
- **Users** can easily submit enquiries from the home page
- **Data** is properly validated and sent to the backend
- **Admin** receives all enquiries in their dashboard
- **Tracking** is possible through status updates
- **Contact info** is stored for follow-up (customer phone number)

The system provides a complete communication channel between customers and admin for service inquiries, class bookings, and custom order requests.
