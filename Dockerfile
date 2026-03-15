# Use official Node image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the project
COPY . .

# Generate prisma client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "run", "dev"]