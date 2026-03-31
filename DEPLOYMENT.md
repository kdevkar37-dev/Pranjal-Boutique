# Pranjal's Boutique - Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Git
- Environment variables configured

## Local Development

### Backend
```bash
cd backend
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Production Deployment

### Option 1: Docker Compose (Recommended for Simple Deployment)

1. **Set Environment Variables**
```bash
cp .env.example.backend .env
# Edit .env with your production values
```

2. **Build and Run**
```bash
docker-compose up -d
```

3. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

4. **View Logs**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

5. **Stop Services**
```bash
docker-compose down
```

### Option 2: Manual Docker Build

**Backend:**
```bash
docker build -f Dockerfile.backend -t pranjal-boutique-backend:latest .
docker run -d -p 8080:8080 \
  -e MONGODB_URI=mongodb://mongo:27017/pranjal_boutique \
  -e JWT_SECRET=your-secret-key \
  -e GOOGLE_CLIENT_ID=your-google-id \
  -e GOOGLE_CLIENT_SECRET=your-google-secret \
  --name boutique-backend \
  pranjal-boutique-backend:latest
```

**Frontend:**
```bash
docker build -f Dockerfile.frontend -t pranjal-boutique-frontend:latest .
docker run -d -p 3000:80 \
  --name boutique-frontend \
  pranjal-boutique-frontend:latest
```

### Option 3: Cloud Deployment

#### AWS EC2
1. Create EC2 instance (Ubuntu 22.04)
2. Install Docker: `sudo apt update && sudo apt install docker.io`
3. Install Docker Compose: `sudo apt install docker-compose`
4. Clone your repository
5. Set environment variables
6. Run: `docker-compose up -d`

#### Heroku
1. Create `Procfile`:
```
web: java -jar target/app.jar
```
2. Set config vars on Heroku
3. Deploy with git push

#### Linode/DigitalOcean
Similar to AWS - create a Linux instance and follow Docker Compose steps

## Environment Variables (Production)

### Backend (.env or docker-compose.yml)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Strong random secret (min 32 chars)
- `GOOGLE_CLIENT_ID` - OAuth2 Google client ID
- `GOOGLE_CLIENT_SECRET` - OAuth2 Google client secret
- `ADMIN_EMAIL` - Initial admin email
- `ADMIN_PASSWORD` - Initial admin password
- `CORS_ALLOWED_ORIGINS` - Comma-separated allowed origins
- `OAUTH2_REDIRECT_URL` - OAuth2 callback URL

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth2 client ID

## Database Setup

### MongoDB Atlas (Cloud)
1. Create cluster at mongodb.com
2. Add IP whitelist
3. Create database user
4. Get connection string
5. Add to `MONGODB_URI`

### Self-Hosted MongoDB
```bash
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=pranjal_boutique \
  mongo:latest
```

## SSL/HTTPS Setup

### Using Let's Encrypt with Nginx
```bash
docker run --rm -it -p 80:80 -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certbot certonly --standalone \
  -d your-domain.com
```

Update nginx.conf to use SSL certificates.

## Monitoring

### Logs
```bash
docker-compose logs -f
docker logs container-name
```

### Health Checks
- Backend: `curl http://localhost:8080/actuator/health`
- Frontend: Check http://localhost:3000

## Scaling

### Multiple Backend Instances
Update docker-compose.yml to add multiple backend services and load balance with Nginx.

## Backup

### MongoDB Backup
```bash
docker exec pranjal-mongodb mongodump --out /backup
docker cp pranjal-mongodb:/backup ./backup
```

## Troubleshooting

### 502 Bad Gateway
- Check backend health: `docker logs pranjal-backend`
- Verify MONGODB_URI connection

### Blank Frontend
- Check browser console for errors
- Verify VITE_API_URL configuration
- Check backend CORS settings

### Connection Refused
- Ensure both containers are running: `docker-compose ps`
- Check firewall rules
- Verify port mappings

## Post-Deployment Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure MongoDB Atlas with production database
- [ ] Set up Google OAuth2 credentials
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring & logging
- [ ] Configure backups
- [ ] Test all authentication flows
- [ ] Verify API endpoints
- [ ] Set up health checks
- [ ] Document admin credentials (securely)
- [ ] Plan database maintenance windows
- [ ] Set up error tracking (Sentry, etc.)

## Support

For issues, check logs and verify:
1. Environment variables are correctly set
2. MongoDB connection is working
3. Network connectivity between services
4. Firewall rules allow traffic
