# Deployment Checklist

## Pre-Deployment

### Security
- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET (min 32 characters, use `openssl rand -base64 32`)
- [ ] Configure OAuth2 credentials (Google)
- [ ] Enable HTTPS/TLS certificates
- [ ] Review CORS allowed origins
- [ ] Verify MongoDB authentication is enabled
- [ ] Update security headers in Nginx config

### Configuration
- [ ] Set up MongoDB Atlas or self-hosted MongoDB
- [ ] Create production database
- [ ] Set environment variables
- [ ] Update API endpoint URLs
- [ ] Configure domain name (DNS)
- [ ] Set up email service (if needed)

### Testing
- [ ] Test all authentication flows
- [ ] Test API endpoints
- [ ] Test file uploads
- [ ] Test database connectivity
- [ ] Test CORS responses
- [ ] Test error handling
- [ ] Load test with expected traffic

## Deployment Day

### Infrastructure
- [ ] Provision server/instances
- [ ] Install Docker & Docker Compose
- [ ] Configure firewall rules
- [ ] Set up SSL/TLS certificates
- [ ] Configure backups

### Application
- [ ] Pull latest code
- [ ] Build Docker images
- [ ] Configure environment variables
- [ ] Start services with `docker-compose up -d`
- [ ] Verify health checks pass
- [ ] Run smoke tests

### Monitoring & Logging
- [ ] Set up application logging
- [ ] Configure Docker log rotation
- [ ] Set up monitoring/alerts
- [ ] Configure backups
- [ ] Test backup restore process

## Post-Deployment

- [ ] Monitor application logs for errors
- [ ] Check user feedback
- [ ] Monitor server resources (CPU, memory, disk)
- [ ] Test real user flows
- [ ] Verify backups are working
- [ ] Document any issues encountered
- [ ] Plan rollback strategy

## Rollback Plan

If issues occur:

```bash
# Stop current deployment
docker-compose down

# Revert to previous version
git checkout previous-tag
docker-compose up -d

# Restore database from backup
mongorestore --uri="mongodb://..." --archive=/path/to/backup.archive
```

## Performance Monitoring

Monitor these metrics:
- API response times (target < 200ms)
- Database query times
- Server CPU usage (keep < 80%)
- Memory usage
- Disk space
- Network throughput
- Error rates

## Support Contacts

- DevOps: [name]
- Database Admin: [name]
- Application Owner: [name]
