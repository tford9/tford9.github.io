# Astro dev/build container
FROM node:20-bullseye
WORKDIR /app

# Install deps first
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copy source
COPY . .

# Expose dev server
EXPOSE 4321
CMD ["npm", "run", "dev"]
