# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.14](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.1.13...v0.1.14) (2021-10-25)


### Bug Fixes

* add content encoding header. restructure log payload json to fix nesting issue. ([c4f69f4](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/c4f69f44ab6f255a5d7b444be66980f933b04ecf))

### [0.1.13](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.1.12...v0.1.13) (2021-10-25)


### Bug Fixes

* fix logic in https call to NR ([726532b](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/726532b8ccbbcc7788acff58bb29795bb68eac46))

### [0.1.12](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.1.11...v0.1.12) (2021-10-25)


### Bug Fixes

* add maxlistener config to NewRelicTransport, update logger config to only provide NewRelicTransport when license is defined ([6a44a1a](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/6a44a1ac9810e3b2ad03f29df3bfa1bb4eba21a8))

### [0.1.11](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.1.10...v0.1.11) (2021-10-25)


### Bug Fixes

* move babel-polyfill from dev to main dependencies ([b6b1c0d](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/b6b1c0d4d0dd04f079bc9670596b73753f31ba4d))

### [0.1.10](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.1.9...v0.1.10) (2021-10-25)


### Bug Fixes

* reenable log delivery, separate minimum delivery config between periodic and immediate log delivery, update default config values ([64ff31b](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/64ff31befa8638a8a622950dc05304a2951c13ab))

### [0.1.9](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.1.7-0...v0.1.9) (2021-10-25)


### Features

* **logging-api:** add logging api as Winston Transport ([d792177](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/d79217757fb098c9ca56ac554131d2489ba4fda2))
* **new-relic:** update config to point to eu endpoint, update git config, rebuild artifacts ([72d1df3](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/72d1df324426739b33b5af030cff2a85775804b1))

### [0.1.8](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.1.7...v0.1.8) (2021-10-22)


### Features

* **new-relic:** update config to point to eu endpoint, update git config, rebuild artifacts ([e714d5b](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/e714d5be9d8fc0803315cda30b11d7de1225930f))

### [0.1.7](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.1.7-0...v0.1.7) (2021-10-22)


### Features

* **logging-api:** add logging api as Winston Transport ([e98e52d](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/e98e52d6d6c7bad329b7c1aa902d152af1c9ce37))

### [0.1.7-0](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.1.6...v0.1.7-0) (2021-10-20)


### Features

* **nr-log-api:** add testing implementation of log API ([fb06559](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/fb0655912a76db032b70cf46f707cd7b25d61a06))

### 0.1.6 (2021-10-20)


### Features

* add build script, add babel config, add built dist package ([5641754](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/5641754e6d7c342a3c5aaf48e23056c1bfa233a3))
* add typing to build output, bump version ([91a0181](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/91a01810c3a6b0c8cc6d3c93d4ba516a359017dc))
* initial commit ([e4a94b0](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/e4a94b0732903d7d64815fe06ef17077508a6ae7))


### Bug Fixes

* **cls:** fix for cls namespace usage missing run call ([628acdb](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/628acdbd32cc07920166dd581186d200f1c143d4))
* **cls:** removed hanging cls dependency ([9c8cffd](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/9c8cffd233c1c02431feec4519b3dfb47de9fe72))
* update main script location to point to dist folder ([d0c2c25](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/d0c2c259cc45eb18356399a832fa6ba98e2e74f7))
