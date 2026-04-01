FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY dist ./dist
USER node
EXPOSE ${PORT}
CMD ["node", "dist/index.js"]