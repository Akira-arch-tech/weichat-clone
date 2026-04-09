FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --production

# Copy source
COPY src/ ./src/

# Create directories
RUN mkdir -p data uploads

EXPOSE 3001

CMD ["node", "src/index.js"]
