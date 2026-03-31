# Quick Start Guide - Deployment Ready

## 📋 Setup Environment Variables

### For Docker Deployment

Create a `.env` file in the root directory:

```bash
cp .env.example.backend .env
```

Edit `.env` with your production values:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=generate-a-long-random-base64-secret-key
ADMIN_EMAIL=admin@pranjalboutique.com
ADMIN_PASSWORD=SecurePassword@123
ADMIN_NAME=Pranjal Admin
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/pranjal_boutique
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
OAUTH2_REDIRECT_URL=https://yourdomain.com/oauth2/success
```

## 🚀 Deploy with Docker Compose (Recommended)

### Single Command Deployment

```bash
docker-compose up -d
```

Access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services

```bash
docker-compose down
```

## 🏗️ Infrastructure Options

### 1. **Local Development** (Current)
- ✅ Already running on ports 3000 & 8080
- Uses Docker Compose

### 2. **AWS Deployment**
```bash
# On EC2 instance
git clone your-repo
cd Pranjal-Boutique
cp .env.example.backend .env
# Edit .env with AWS-specific values
docker-compose up -d
```

### 3. **DigitalOcean App Platform**
- Create app from repository
- Set environment variables in UI
- Deploy (auto-deploys on git push)

### 4. **Heroku**
- Create `Procfile`
- Set environment variables
- Push to Heroku git

### 5. **Linode Kubernetes**
- Create K8s cluster
- Deploy using docker-compose as reference
- Set up load balancer

## ✅ Production Checklist

Before deploying to production:

1. **Security**
   - [ ] Generate strong JWT_SECRET: `openssl rand -base64 32`
   - [ ] Set strong admin password
   - [ ] Configure OAuth2 credentials
   - [ ] Enable HTTPS with valid SSL certificate
   - [ ] Update CORS allowed origins

2. **Database**
   - [ ] Use MongoDB Atlas (managed service)
   - [ ] Enable authentication & encryption
   - [ ] Set up backups
   - [ ] Test restore process

3. **Application**
   - [ ] Run production build: `mvn clean package`
   - [ ] Test all API endpoints
   - [ ] Verify error handling
   - [ ] Load testing

4. **Infrastructure**
   - [ ] Set up monitoring & logging
   - [ ] Configure auto-restart
   - [ ] Set up health checks
   - [ ] Plan disaster recovery

## 📊 Monitoring Commands

```bash
# Check container status
docker-compose ps

# Check resource usage
docker stats

# View detailed logs
docker-compose logs --tail=100 backend

# Health check
curl http://localhost:8080/actuator/health
```

## 🔄 Updates & Rollbacks

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Rollback to Previous Version

```bash
# Revert code
git checkout previous-commit-hash

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

## 🆘 Troubleshooting

### Blank Frontend
```bash
# Check frontend logs
docker logs pranjal-frontend

# Verify API connection
curl -I http://localhost:8080/api/services
```

### Backend Connection Issues
```bash
# Check DB connection
docker logs pranjal-backend | grep -i mongodb

# Verify DB is accessible
docker-compose exec mongodb mongosh
```

### Port Already in Use
```bash
# Kill existing process
sudo lsof -ti:3000,8080 | xargs kill -9

# Or change port in docker-compose.yml
```

## 📚 Full Documentation

See detailed guides:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre/post deployment tasks
- [PRODUCTION_BUILD.md](./PRODUCTION_BUILD.md) - Production build configurations

## 🎯 Next Steps

1. ✅ Configure environment variables
2. ✅ Run database migrations (if any)
3. ✅ Deploy with Docker Compose
4. ✅ Verify application is running
5. ✅ Set up monitoring & logs
6. ✅ Configure backups

**Your app is now deployment-ready!** 🚀
