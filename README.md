# Quickshow

Quickshow is a website where users can book tickets for movies.

## Getting Started

### Frontend

```bash
cd client
npm install
npm run dev
```

### Server

```bash
cd server
npm install
npm run dev
```

## Environment Variables

cd server .env

PORT=""
MONGODB_URI=""
CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
SENDER_EMAIL=""
SMTP_USER=""
SMTP_PASS=""  
TMDB_API_ACCESS_TOKEN=""

cd client .env
VITE_CURRENCY=""
VITE_CLERK_PUBLISHABLE_KEY=""
VITE_BASE_URL=""
VITE_TMDB_BASE_IMG_URL=""
