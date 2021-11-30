# About PnpM and Monorepo

This document is cheat sheet for PnpM

## Install all dependencies

```bash
pnpm i
```

## Install `@jigenlab/utils` for `@jigenlab/core`

```bash
pnpm i @jigenlab/utils --filter @jigenlab/core
```

## Run a npm script `build` for all package recursive

(It will skip packages those without this npm script)

```bash
pnpm run -r build
```

## Run npm script `watch` for all package parallel

```bash
pnpm run --parallel watch
```

## Run npm script `build` for '@jigenlab/core' and all of its dependencies

```bash
pnpm build --filter @jigenlab/core...
```
