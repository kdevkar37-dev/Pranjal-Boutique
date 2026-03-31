# Backend Build Configuration for Production

## Production Build

```bash
mvn clean package -DskipTests -P prod
```

## JAR Execution

```bash
java -jar target/boutique-backend-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --spring.data.mongodb.uri=mongodb+srv://user:pass@cluster.mongodb.net/pranjal_boutique \
  --app.jwt.secret=your-secret-key \
  --app.cors.allowed-origins=https://yourdomain.com \
  --logging.level.root=INFO
```

## Performance Tuning

### JVM Options
```bash
JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

### Database Connection Pool
- MongoDB driver handles connection pooling automatically
- Default pool size: 100 connections (configurable)

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters
- [ ] MongoDB uses authentication
- [ ] CORS is restricted to specific origins
- [ ] OAuth2 credentials are secure
- [ ] Admin credentials are changed from defaults
- [ ] HTTPS is enabled
- [ ] Security headers are configured
