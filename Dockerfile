# node:22-alpine3.18
FROM node:latest as BUILD_IMAGE
# This command sets the working directory inside the Docker container to "/app". This is the directory where subsequent commands will be executed.
WORKDIR /app

# Required for vite
COPY package.json .
RUN npm install
# This sets an environment variable named "PATH" to include the "./node_modules/.bin" directory. This ensures that locally installed Node.js modules can be executed directly from the command line without specifying their full path.
ENV PATH="./node_modules/.bin:$PATH"

# This command copies all the files and directories from the current directory (on your host machine, where the Dockerfile is located) into the "/app" directory within the Docker container. from . to . (workdir)
COPY . .

# Set default values for environment variables (This is set on github action for production test and main builds)
ARG VITE_PRODUCTION_BASE_URL=https://127.0.0.1:3000/
ARG VITE_PRODUCTION_BACKEND_API_URL=https://127.0.0.1:8000/v1/api/
ARG VITE_PRODUCTION_PROFILES_BASE_URL=https://127.0.0.1:3000/staff/
ARG VITE_SPMS_VERSION=3.0.0

# Set environment variables for runtime access
ENV VITE_PRODUCTION_BASE_URL=$VITE_PRODUCTION_BASE_URL
ENV VITE_PRODUCTION_BACKEND_API_URL=$VITE_PRODUCTION_BACKEND_API_URL
ENV VITE_PRODUCTION_PROFILES_BASE_URL=$VITE_PRODUCTION_PROFILES_BASE_URL
ENV VITE_SPMS_VERSION=$VITE_SPMS_VERSION

# This command runs the "npm build" script inside the container (it will use above env variables).
RUN npm run build 

# Multistage build to prevent code exposure / reduce image size
FROM node:latest as PRODUCTION_IMAGE
WORKDIR /client

COPY --from=BUILD_IMAGE /app/dist/ /client/dist/

COPY package.json .
COPY vite.config.ts .
RUN npm cache clean --force && npm install typescript

# Change ownership of the /client directory to the non-root user
RUN chown -R 1000:1000 /client
USER 1000

EXPOSE 3000
CMD ["npm", "run", "preview"]