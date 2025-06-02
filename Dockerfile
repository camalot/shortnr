FROM node:20-alpine


# copy all files in ./app to /app in the container
COPY ./app /app

# set the working directory to /app
WORKDIR /app

# install the dependencies
RUN apk add --no-cache curl && npm install --omit=dev

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "curl", "-f", "http://127.0.0.1:3000/healthz" ]

EXPOSE 3000

# start the app
CMD ["node", "/app/bin/www"]