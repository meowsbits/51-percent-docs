# 51-percent-docs

This repo contains source code for a website documenting
the current state and estimates for a 51-percent attack
on ETC.

## Features

- Live reload in development
- Webpack
- Sass compilation (and minification/autoprefixing in production)
- ES6+ transpilation (and minification/uglyfication in production)
- ES Modules

## Logic

Github Actions runs a cron job that fetches:
- the latest blocks from ETH and ETC
- the latest USD exchange rate for ETC

The data is then persisted in a JSON file, and interpolated
as Javascript for client consumption as module exports.

See [./.github/workflows/data.yml](./.github/workflows/data.yml).

## Usage

### Requires

- Node <= v14 (later versions are not supported by some dependencies)

### Development

#### Install dependencies

```shell
yarn
```

#### Run development server

```shell
yarn dev
```

Will open your default browser to http://localhost:8080/public

Webpack will watch for changes in the `./src` directory and output the bundled assets to `./public/assets`. In parallel, the development server will watch for changes in the `./public` directory and live reload the browser.

#### Build production bundles

Output dir: `./public`


```shell
yarn build
```

## Publish (Github Pages)

Push to `master`. See [./.github/workflows/pages.yml](./.github/workflows/pages.yml).
