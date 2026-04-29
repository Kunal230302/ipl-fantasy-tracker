# DNS Configuration for fantasypointtracker.live

## Domain Purchase
1. Purchase domain from registrar (GoDaddy, Namecheap, etc.)
2. Domain: fantasypointtracker.live
3. Enable DNS management

## DNS Records for Firebase Hosting

### A Records (Primary)
```
Type: A
Name: @
Value: 192.168.1.1
TTL: 1 Hour

Type: A  
Name: www
Value: 192.168.1.1
TTL: 1 Hour
```

### CNAME Record (Alternative)
```
Type: CNAME
Name: www
Value: fantasypointtracker.firebaseapp.com
TTL: 1 Hour
```

## SSL Certificate
- Firebase provides free SSL certificate
- Automatic provisioning after domain verification
- May take 24-48 hours to propagate

## Verification
1. Add TXT record for domain ownership
2. Wait for DNS propagation (24-48 hours)
3. Verify in Firebase console

## Testing
```bash
# Check DNS propagation
nslookup fantasypointtracker.live
dig fantasypointtracker.live

# Check SSL certificate
openssl s_client -connect fantasypointtracker.live:443
```
