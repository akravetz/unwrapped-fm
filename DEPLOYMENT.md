# Deployment Guide for unwrapped.fm

This guide covers deploying unwrapped.fm to production with support for both `unwrapped.fm` and `www.unwrapped.fm` domains.

## Architecture Overview

- **Frontend**: Deployed on Vercel (React/Vite)
- **Backend**: Deployed on Railway (FastAPI/Python)
- **Database**: PostgreSQL on Railway
- **Domains**:
  - `unwrapped.fm` → Frontend (Vercel)
  - `www.unwrapped.fm` → Frontend (Vercel)
  - `api.unwrapped.fm` → Backend (Railway)

## Prerequisites

1. **Domain Registration**: Ensure `unwrapped.fm` is registered and accessible
2. **Spotify Developer App**: Create production Spotify app with correct redirect URIs
3. **Accounts**: Vercel and Railway accounts set up

## Backend Deployment (Railway)

### 1. Database Setup
```bash
# Railway will automatically provision PostgreSQL
# Note the connection string for environment variables
```

### 2. Environment Variables
Set these in Railway dashboard:

```env
ENVIRONMENT=production
PRODUCTION_DOMAIN=unwrapped.fm
DATABASE_URL=postgresql://postgres:password@host:port/railway
SECRET_KEY=your-secure-random-secret-key-here
SPOTIFY_CLIENT_ID=your_production_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_production_spotify_client_secret
SPOTIFY_REDIRECT_URI=https://api.unwrapped.fm/api/v1/auth/callback
FRONTEND_URL=https://unwrapped.fm
BACKEND_URL=https://api.unwrapped.fm
```

### 3. Deploy Backend
```bash
# Connect Railway to your GitHub repo
# Railway will auto-deploy from backend/ directory
# Set custom domain: api.unwrapped.fm
```

## Frontend Deployment (Vercel)

### 1. Environment Variables
Set in Vercel dashboard:

```env
VITE_API_BASE_URL=https://api.unwrapped.fm
```

### 2. Deploy Frontend
```bash
# Connect Vercel to your GitHub repo
# Set build settings:
# - Framework: Vite
# - Root Directory: frontend
# - Build Command: npm run build
# - Output Directory: dist
```

### 3. Domain Configuration
In Vercel dashboard:
1. Add custom domains:
   - `unwrapped.fm`
   - `www.unwrapped.fm`
2. Configure DNS (choose one option):

#### Option A: Use Vercel Nameservers (Recommended)
1. In your domain registrar, set nameservers to Vercel's
2. Vercel handles all DNS automatically

#### Option B: Use Current Nameservers
Add these DNS records:
```
Type: A
Name: @
Value: 76.76.19.61

Type: A
Name: www
Value: 76.76.19.61

Type: CNAME
Name: api
Value: your-railway-app.railway.app
```

## Spotify OAuth Configuration

### 1. Create Production Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create new app for production
3. Set redirect URIs:
   - `https://api.unwrapped.fm/api/v1/auth/callback`
4. Note Client ID and Secret for environment variables

### 2. Update Environment Variables
Update both Railway and local development with production Spotify credentials.

## SSL/HTTPS Configuration

- **Vercel**: Automatic SSL certificates for all domains
- **Railway**: Automatic SSL for custom domains
- **Verification**: All URLs should use HTTPS in production

## Environment-Specific Configuration

The application automatically detects the environment:

### Development
- CORS: `localhost:5174`, `127.0.0.1:5174`
- API: `https://localhost:8443`

### Production
- CORS: `https://unwrapped.fm`, `https://www.unwrapped.fm`
- API: `https://api.unwrapped.fm`

## Deployment Checklist

### Pre-Deployment
- [ ] Domain registered and accessible
- [ ] Spotify production app created
- [ ] Railway and Vercel accounts ready
- [ ] Environment variables prepared

### Backend (Railway)
- [ ] Database provisioned
- [ ] Environment variables set
- [ ] Custom domain `api.unwrapped.fm` configured
- [ ] SSL certificate active
- [ ] Health check endpoint responding

### Frontend (Vercel)
- [ ] Build successful
- [ ] Environment variables set
- [ ] Custom domains configured (`unwrapped.fm`, `www.unwrapped.fm`)
- [ ] SSL certificates active
- [ ] DNS propagation complete

### Post-Deployment
- [ ] Test authentication flow
- [ ] Test music analysis
- [ ] Test sharing functionality
- [ ] Verify CORS configuration
- [ ] Test both domain variants

## Monitoring and Maintenance

### Health Checks
- Backend: `https://api.unwrapped.fm/health`
- Frontend: `https://unwrapped.fm`

### Logs
- Railway: Built-in logging dashboard
- Vercel: Function logs and analytics

### Updates
- Backend: Push to main branch → auto-deploy
- Frontend: Push to main branch → auto-deploy

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `ENVIRONMENT=production` is set
   - Check domain configuration in settings

2. **Spotify OAuth Fails**
   - Verify redirect URI matches exactly
   - Check client ID/secret are for production app

3. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check Railway database status

4. **Domain Not Resolving**
   - Wait 24-48 hours for DNS propagation
   - Verify DNS records are correct

### Support
- Railway: [Railway Documentation](https://docs.railway.app/)
- Vercel: [Vercel Documentation](https://vercel.com/docs)
- Spotify: [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)

## Security Considerations

1. **Environment Variables**: Never commit production secrets
2. **JWT Secret**: Use cryptographically secure random key
3. **HTTPS Only**: All production traffic uses SSL
4. **CORS**: Restricted to production domains only
5. **Database**: Railway provides managed security
