FROM node:20-alpine


# copy all files in ./app to /app in the container
COPY ./app /app

# set the working directory to /app
WORKDIR /app

# install the dependencies
RUN npm install --omit=dev

EXPOSE 3000

# start the app
CMD ["node", "index.js"]