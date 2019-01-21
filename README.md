# spa-static-server

A docker image that will run a static build of a SPA, redirecting 404 to index.html

A public docker image that is pre-built for running cypress tests. This repository is auto-build by docker and the image can be downloaded from `transcendio/spa-static-server`.

## Setup

1. Clone:
    ```sh
    git clone https://github.com/transcend-io/spa-static-server.git
    ```

2. Build the docker image
    ```sh
    npm run build
    ```

## Use

An example of using this docker file can be found in `example.yml`.

1. Modify the file to point to files on your local machine
2. Run `npm run build` to build the image
3. Docker compose the example `docker-compose -f example.yml up`
