# This command sets the base image for the Docker image. It specifies the use of the "node:20-alpine3.17" image, which is a lightweight Alpine Linux-based image that comes with Node.js pre-installed
FROM node:20-alpine3.17 as BUILD_IMAGE
# This command sets the working directory inside the Docker container to "/app". This is the directory where subsequent commands will be executed.
WORKDIR /app
# Required for vite
COPY package.json .
RUN npm install
# This sets an environment variable named "PATH" to include the "./node_modules/.bin" directory. This ensures that locally installed Node.js modules can be executed directly from the command line without specifying their full path.
ENV PATH="./node_modules/.bin:$PATH"

# This command copies all the files and directories from the current directory (on your host machine, where the Dockerfile is located) into the "/app" directory within the Docker container. from . to . (workdir)
COPY . .
# This command runs the "npm build" script inside the container.
RUN npm run build


# Multistage to prevent code exposure
FROM node:20-alpine3.17 as PRODUCTION_IMAGE
WORKDIR /client

COPY --from=BUILD_IMAGE /app/dist/ /client/dist/

COPY package.json .
COPY vite.config.ts .
RUN npm install typescript

EXPOSE 3000
CMD ["npm", "run", "preview"]

# Commands:
# docker build --tag dockertest .
# docker run --publish 3000:3000 dockertest NOT # docker run dockertest 
# docker-compose run app