# spa-static-server

A simple javascript server to host a production SPA build, or an auto-reloading development build, using environment variables only.

## Features

- Builds a simple docker image useful for running static builds from a docker compose yml file hosted at `transcendio/spa-static-server`.
- Host with HTTPS
- Runs a static build redirecting 404s to `index.html`
- Has the ability to download builds from
- Auto-reloads on build change in `NODE_ENV=development`
- Fetches GraphQL fragment types and writes them to file
- Proxies all requests matching `PROXY_ROUTE` to the backend

## Setup

1. Clone:

   ```sh
   git clone https://github.com/transcend-io/spa-static-server.git
   ```

2. Build the docker image

   ```sh
   npm run build
   ```

3. Install locally

   ```sh
   npm i
   ```

## Usage as Docker Image

An example of using this docker file can be found in `examples/example.yml`.

1. Modify the file to point to files on your local machine
2. Run `npm run build` to build the image
3. Docker compose the example `examples/docker-compose -f example.yml up`

## Usage as Cli

The server can be installed with npm and used as at the command line.

```sh
npm i transcend-io/spa-static-server
BUILD_ENV_PATH=./env tr-server
```

## Environment Variables

| Name                  | Comment                                                                              | Default              | Required                         |
| --------------------- | ------------------------------------------------------------------------------------ | -------------------- | -------------------------------- |
| BACKEND_URL           | The URL of the backend server                                                        | _NA_                 | REQUIRED                         |
| FRONTEND_URL          | The URL to host the frontend server on                                               | _NA_                 | REQUIRED                         |
| PROXY_ROUTE           | Proxy all requests made by the frontend to the `BACKEND_URL` starting with this path | /backend             | REQUIRED                         |
| NODE_ENV              | Node environment                                                                     | production           | OPTIONAL                         |
| WEBPACK_PATH          | Webpack configuration path                                                           | _NA_                 | REQUIRED if NODE_ENV!=production |
| SSL_CERT              | The location of the SSL certificate                                                  | /ssl/certificate.pem | OPTIONAL                         |
| SSL_KEY               | The location of the SSL key                                                          | /ssl/private.key     | OPTIONAL                         |
| BUILD_PATH            | The location to keep the build                                                       | /build               | OPTIONAL                         |
| S3_BUCKET             | The location of the S3 bucket holding the build                                      | _NA_                 | OPTIONAL                         |
| AWS_ACCESS_KEY_ID     | The AWS access key needed to download from the bucket                                | _NA_                 | REQUIRED if S3_BUCKET provided   |
| AWS_SECRET_ACCESS_KEY | The AWS secret key needed to download from the bucket                                | _NA_                 | REQUIRED if S3_BUCKET provided   |
| WRITE_FRAGMENT_PATH   | Provide the path to where GraphQL fragments be written                               | _NA_                 | OPTIONAL                         |
| FRAGMENTS_ROUTE       | The GraphQL route to get fragments from on BACKEND_URL                               | /graphql             | OPTIONAL                         |
| BUILD_ENV_PATH        | A .env file to read environment variables from                                       | _NA_                 | OPTIONAL                         |

- TODO image could be considerable smaller
