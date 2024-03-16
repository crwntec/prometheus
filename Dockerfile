FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Copy frontend and server directories
COPY frontend frontend
COPY server server

# Install app dependencies for frontend
RUN cd frontend && npm install
ENV REACT_APP_BACKEND_URL=http://localhost:8080

# Install app dependencies for backend
RUN cd ./server && npm install

# Expose port 3000 for frontend
EXPOSE 3000

# Define a custom command to run npm start in both directories
CMD cd frontend && npm start & cd ../server && npm start
