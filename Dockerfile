# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Generate environment.prod.ts from Render environment variables
# Set these in: Render Dashboard → Your Service → Environment
ARG FIREBASE_API_KEY
ARG FIREBASE_AUTH_DOMAIN
ARG FIREBASE_PROJECT_ID
ARG FIREBASE_STORAGE_BUCKET
ARG FIREBASE_MESSAGING_SENDER_ID
ARG FIREBASE_APP_ID

RUN echo "export const environment = { \
  production: true, \
  firebaseConfig: { \
    apiKey: '${FIREBASE_API_KEY}', \
    authDomain: '${FIREBASE_AUTH_DOMAIN}', \
    projectId: '${FIREBASE_PROJECT_ID}', \
    storageBucket: '${FIREBASE_STORAGE_BUCKET}', \
    messagingSenderId: '${FIREBASE_MESSAGING_SENDER_ID}', \
    appId: '${FIREBASE_APP_ID}', \
  }, \
};" > src/environments/environment.prod.ts

RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/dist/cv-admin/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
