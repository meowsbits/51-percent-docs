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

## Usage

- Install dependencies

```shell
yarn
```

- Run development server

```shell
yarn dev
```

Will open your default browser to http://localhost:8080/public

Webpack will watch for changes in the `./src` directory and output the bundled assets to `./public/assets`. In parallel, the development server will watch for changes in the `./public` directory and live reload the browser.

- Build production bundles

```shell
yarn build
```

- Build and deploy to __Github Pages__

```shell
git checkout gh-pages
yarn gh-pages
git add . && git commit -m "Update site"
git push origin gh-pages
```

