# Setup & Deployment Guide - Pranjal Boutique

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v16+)
- Java 17+
- Maven
- MongoDB running on localhost:27017

### Step 1: Setup Backend

```bash
cd backend

# Create uploads directory for images
mkdir -p uploads/images

# Set environment variables (Windows PowerShell)
$env:MONGODB_URI = "mongodb://localhost:27017/pranjal_boutique"
$env:JWT_SECRET = "your-secret-key-here"
$env:ADMIN_EMAIL = "admin@pranjalboutique.com"
$env:ADMIN_PASSWORD = "Admin@123"
$env:ADMIN_NAME = "Pranjal Admin"
$env:GOOGLE_CLIENT_ID = "your-google-client-id"
$env:GOOGLE_CLIENT_SECRET = "your-google-client-secret"

# Or add to application.properties for local dev
# (Already configured with defaults in the file)

# Compile and run
mvn clean compile
mvn spring-boot:run
# Backend runs at http://localhost:8080
```

### Step 2: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables (Windows PowerShell)
$env:VITE_API_URL = "http://localhost:8080"

# Run development server
npm run dev
# Frontend runs at http://localhost:5173
```

### Step 3: Test the Application

1. Open http://localhost:5173 in your browser
2. Navigate to Services page to see services
3. Submit an inquiry as a customer
4. Go to Login and authenticate as Admin
5. Visit Admin Dashboard to manage services and inquiries

---

## 📦 Docker Deployment

### Step 1: Build Images

```bash
# From project root
docker build -f Dockerfile.backend -t pranjal-boutique-backend .
docker build -f Dockerfile.frontend -t pranjal-boutique-frontend .
```

### Step 2: Run with Docker Compose

```bash
# From project root
docker-compose up -d

# This starts:
# - Backend: http://localhost:8080
# - Frontend: http://localhost:3000
# - MongoDB: localhost:27017
```

### Step 3: Verify Containers

```bash
docker-compose logs backend    # Check backend logs
docker-compose logs frontend   # Check frontend logs
docker ps                       # List running containers
```

### Step 4: Stop Containers

```bash
docker-compose down    # Stop and remove containers
docker-compose down -v # Also remove volumes (data)
```

---

## 🔐 Environment Variables

### Backend (Set in Docker or system environment)

```bash
# MongoDB
MONGODB_URI=mongodb://mongo:27017/pranjal_boutique

# JWT
JWT_SECRET=change-this-to-a-long-secure-key

# Admin User (auto-created on startup)
ADMIN_EMAIL=admin@pranjalboutique.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Pranjal Admin

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS (for frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# OAuth2 Redirect
OAUTH2_REDIRECT_URL=http://localhost:3000/oauth2/success

# Image Upload
UPLOAD_DIR=uploads/images
UPLOAD_MAX_SIZE=5242880 # 5MB in bytes
```

### Frontend (.env or environment)

```bash
VITE_API_URL=http://localhost:8080
```

---

## 📂 File Upload Configuration

### Local Development

Images are stored in `uploads/images/` directory (relative to where backend runs).

**Important**: This directory is created automatically by the ImageService, but you can pre-create it:

```bash
mkdir -p uploads/images
chmod 755 uploads/images  # On Linux/Mac
```

### Docker

Images are stored in the `uploads/images/` volume mounted in docker-compose.yml.

**To persist images across container restarts, the volume is mounted:**

```yaml
volumes:
  - ./uploads:/app/uploads  # Backend container
```

### Production (Cloud Deployment)

For S3 or cloud storage, modify:

1. **ImageService.java**: Update `uploadImage()` and `deleteImage()` methods
2. **WebConfig.java**: Update static resource handler
3. **Environment**: Set S3_BUCKET, AWS credentials, etc.

---

## 🧪 Testing Checklist

### Admin Functions

- [ ] **Add Service**
  - Upload service with image
  - Verify image displays correctly
  - Verify service appears in correct category

- [ ] **Edit Service**
  - Edit service title/description
  - Change service image
  - Verify changes reflect on site

- [ ] **Delete Service**
  - Delete a service
  - Confirm deletion request
  - Verify service is gone

### Customer Features

- [ ] **View Services**
  - Open Services page
  - Filter by category
  - See all service details
  - Image loads properly

- [ ] **Submit Inquiry**
  - Fill inquiry form
  - Submit successfully
  - See confirmation message

- [ ] **View Reviews**
  - See all posted reviews
  - See star ratings
  - Reviews are ordered newest first

- [ ] **Submit Review**
  - Submit a review
  - See it appear immediately
  - Star rating displays correctly

### Admin Dashboard

- [ ] **View Inquiries**
  - See all customer inquiries
  - Status filtering works
  - Stats display correctly

- [ ] **Respond to Inquiry**
  - Write response
  - Send to customer
  - Response appears in green box
  - Status changes to CONTACTED

- [ ] **Manage Inquiry Status**
  - Move inquiry through status flow
  - Reopen closed inquiries
  - Stats update accordingly

- [ ] **Review Management**
  - See all reviews
  - Delete inappropriate reviews
  - Analytics update after deletion

---

## 🐛 Troubleshooting

### Backend Issues

**"Port 8080 already in use"**
```bash
# Find and kill process on port 8080
lsof -i :8080           # Mac/Linux
netstat -ano | findstr :8080  # Windows
```

**"Cannot connect to MongoDB"**
- Ensure MongoDB is running: `mongod` or Docker: `docker-compose up mongo`
- Check connection string in application.properties
- Verify permissions on uploads directory

**"Image upload fails"**
- Check uploads directory exists: `ls uploads/images/`
- Check directory permissions: `chmod 755 uploads/images`
- Check file size (max 5MB)
- Check file type (JPG, PNG, GIF, WebP only)

### Frontend Issues

**"Cannot connect to backend"**
- Check VITE_API_URL environment variable
- Ensure backend is running on 8080
- Check browser console for CORS errors

**"Images not loading"**
- Check image upload path in response
- Verify /uploads/** route is accessible
- Check browser console for 404 errors

**"Login fails"**
- Check token is saved in localStorage (DevTools → Application → Local Storage)
- Verify admin credentials
- Check ADMIN_EMAIL matches credentials

---

## 📊 Database Backup/Restore

### MongoDB Local

```bash
# Backup
mongodump --uri "mongodb://localhost:27017/pranjal_boutique" \
          --out ./mongodb_backup

# Restore
mongorestore --uri "mongodb://localhost:27017" ./mongodb_backup
```

### Docker MongoDB

```bash
# Backup
docker-compose exec mongo mongodump --out /backup

# Extract backup
docker cp pranjal-boutique-mongo-1:/backup ./mongodb_backup
```

---

## 🚨 Security Checklist

- [ ] Change default JWT_SECRET to a random, long string
- [ ] Change default ADMIN_PASSWORD
- [ ] Enable HTTPS in production (not just HTTP)
- [ ] Validate all user inputs on backend
- [ ] Don't expose secrets in Docker images
- [ ] Use environment variables for all sensitive data
- [ ] Set up CORS properly (whitelist domains only)
- [ ] Enable MongoDB authentication in production
- [ ] Regularly backup database
- [ ] Monitor image upload for malicious files

---

## 📈 Performance Tips

### Frontend
- Images should be optimized (use WebP when possible)
- Lazy load images on Services page
- Cache API responses where appropriate

### Backend
- MongoDB indexes on frequently queried fields
- Pagination for large result sets
- Image compression for uploaded files

### Deployment
- Use CDN for static assets (images, CSS, JS)
- Enable gzip compression
- Use reverse proxy (nginx) for load balancing

---

## 📝 Logging

### Backend Logs

```bash
# Real-time logs from Docker
docker-compose logs -f backend

# View logs file (if using local development)
# Logs in console output
```

### Frontend Console

Open browser DevTools (F12) → Console tab to see:
- API errors
- Authentication issues
- Image loading problems

---

## 🔄 Deployment to Production

### Option 1: Cloud Server (AWS EC2, DigitalOcean, etc.)

1. **Copy project files** to server
2. **Install dependencies**:
   - Node.js, Java, Maven, MongoDB
3. **Set environment variables**
4. **Build backend**: `mvn clean package`
5. **Build frontend**: `npm run build`
6. **Run on server**: Use PM2 or systemd for auto-restart

### Option 2: Docker Registry (DockerHub, ECR, etc.)

```bash
# Build and tag
docker build -f Dockerfile.backend -t yourregistry/boutique-backend:1.0 .
docker tag yourregistry/boutique-backend:1.0 yourregistry/boutique-backend:latest

# Push
docker push yourregistry/boutique-backend:1.0

# Deploy on server
docker-compose -f docker-compose.prod.yml up -d
```

### Option 3: Platform as a Service (Railway, Render, Heroku, etc.)

Follow platform-specific guides to deploy containerized apps.

---

## 📞 Support

For issues:
1. Check this guide first
2. Review error messages in logs
3. Check browser console (F12)
4. Verify environment variables are set correctly
5. Ensure all dependencies are installed

---

**Last Updated**: April 2026  
**Version**: 1.0
