FROM node:20-alpine
WORKDIR /app
COPY server/ ./server/
RUN cd server && npm install
COPY client/ ./client/
RUN cd client && rm -rf dist && npm install && npm run build
EXPOSE 3000
CMD ["node", "server/index.js"]
