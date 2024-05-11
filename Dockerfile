# This command sets the base image for the Docker image. It specifies the use of the "node:22-alpine3.18" image, which is a lightweight Alpine Linux-based image that comes with Node.js pre-installed
FROM node:22-alpine3.18 as BUILD_IMAGE
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
ARG PRODUCTION_BACKEND_BASE_URL=https://127.0.0.1:8000/
ARG PRODUCTION_BACKEND_API_URL=https://127.0.0.1:8000/v1/api/

# Set environment variables for runtime access
ENV PRODUCTION_BACKEND_BASE_URL=$PRODUCTION_BACKEND_BASE_URL
ENV PRODUCTION_BACKEND_API_URL=$PRODUCTION_BACKEND_API_URL

# This command runs the "npm build" script inside the container.
RUN npm run build -- --PRODUCTION_BACKEND_BASE_URL $PRODUCTION_BACKEND_BASE_URL --PRODUCTION_BACKEND_API_URL $PRODUCTION_BACKEND_API_URL


# Multistage to prevent code exposure
FROM node:22-alpine3.18 as PRODUCTION_IMAGE
WORKDIR /client

COPY --from=BUILD_IMAGE /app/dist/ /client/dist/

COPY package.json .
COPY vite.config.ts .
RUN npm cache clean --force && npm install typescript
EXPOSE 3000
CMD ["npm", "run", "preview"]