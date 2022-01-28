# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.2.17-dev.0](https://github.com/kidsloop-uk/kidsloop-nodejs-logger/compare/v0.2.16...v0.2.17-dev.0) (2022-01-28)

### [0.2.16](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.13...v0.2.16) (2022-01-12)


### Features

* automatically set the response correlation ID header ([c02ee21](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/c02ee218f0f120c8c81e54024cafe6c66d220699))


### Bug Fixes

* export the new types, add @babel/runtime as a dependency ([1873fc8](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/1873fc85304346119422c8445b04a452e7698faa))

### [0.2.15](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.14...v0.2.15) (2021-12-17)


### Features

* automatically set the response correlation ID header ([c02ee21](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/c02ee218f0f120c8c81e54024cafe6c66d220699))

### [0.2.14](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.13...v0.2.14) (2021-12-03)


### Bug Fixes

* export the new types, add @babel/runtime as a dependency ([1873fc8](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/1873fc85304346119422c8445b04a452e7698faa))

### [0.2.13](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.12...v0.2.13) (2021-12-03)


### Features

* add the splat formatter for string interpolation ([3a8815a](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/3a8815acbed852e964c62f677d0584063972db86))
* expose the default correlation header key ([ac3448d](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/ac3448dc16a4f95fccc40d0be6ac209edac1a53a))


### Bug Fixes

* add @babel/plugin-transform-runtime ([fe123ae](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/fe123aed8502a682808bbdbe91a0d7d3d28e1dac))

### [0.2.12](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.10...v0.2.12) (2021-12-02)


### Features

* **KLL-2185:** when available, uses SERVICE_LABEL for service metadata, attempts to also add version, region, and environment from NEW_RELIC_LABELS ([afb4f8e](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/afb4f8eb3ac382700321198ee32b7df8a75ba537))


### Bug Fixes

* **KLL-2185:** fix logical problem related to service name assignment ([0976c22](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/0976c2217257fbd99f7d5ba8a96b8e9cd1c9e3da))

### [0.2.11](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.10...v0.2.11) (2021-12-02)


### Features

* **KLL-2185:** when available, uses SERVICE_LABEL for service metadata, attempts to also add version, region, and environment from NEW_RELIC_LABELS ([afb4f8e](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/afb4f8eb3ac382700321198ee32b7df8a75ba537))


### Bug Fixes

* **KLL-2185:** fix logical problem related to service name assignment ([0976c22](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/0976c2217257fbd99f7d5ba8a96b8e9cd1c9e3da))

### [0.2.10](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.9...v0.2.10) (2021-11-04)


### Features

* LogDeliveryAgent wait for entity.guid to be available before pushing logs, include guid as 'entityGuid' globally ([1a13e1d](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/1a13e1dfe2eb091cc5a7dc4286e2de703f6a7530))

### [0.2.9](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.8...v0.2.9) (2021-11-04)


### Bug Fixes

* fix incorrect log push that caused failure to deliver first set of logs ([8ae8f1d](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/8ae8f1de137e68f42045af99e1267d1815a5efb3))

### [0.2.8](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.7...v0.2.8) (2021-11-04)


### Features

* add logic to stip ansi encoding in string logs ([6a1ca83](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/6a1ca83e75444f4bb96f98fbdd9bf5441c76b32e))

### [0.2.7](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.6...v0.2.7) (2021-11-04)


### Bug Fixes

* reconfigured immediate log send logic to use async sending logic ([64ee99b](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/64ee99b1c762dd23b3cb2e94d5b490f06b1823ef))

### [0.2.6](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.5...v0.2.6) (2021-11-04)


### Bug Fixes

* resolves issues with https payload not fully writing ([310dc0e](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/310dc0ec1065db99c814a167512b9e02582ca2c7))

### [0.2.5](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.4...v0.2.5) (2021-11-03)


### Bug Fixes

* fix log delivery agent marshalling of messages added via stdout/stderr, add additional metadata to these operations ([cb5eec1](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/cb5eec1e8640db51a898d996020b8a625e36347a))

### [0.2.4](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.3...v0.2.4) (2021-11-02)


### Bug Fixes

* **log-delivery:** add warning log when configure is called prior to LogDeliveryAgent initialization ([ca4dc50](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/ca4dc500600761e078f578839e4657f7f1375aa1))

### [0.2.3](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.2...v0.2.3) (2021-10-29)


### Bug Fixes

* rebuilt artifacts ([ea3ea54](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/ea3ea5440285102ceab74abf9b4a6963a15cb147))

### [0.2.2](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.1...v0.2.2) (2021-10-29)


### Bug Fixes

* rebuilt artifacts ([e33ffaa](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/e33ffaa6e15f4c157db39c9f502055d32ac76e35))

### [0.2.1](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.2.0...v0.2.1) (2021-10-29)


### Bug Fixes

* add setMaxListeners to NewRelicTransport ([4f1b9ca](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/4f1b9caa2cfd32ee0a729d0e11eced13f68469f7))

## [0.2.0](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.1.16...v0.2.0) (2021-10-28)

### [0.1.16](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.1.15...v0.1.16) (2021-10-25)


### Bug Fixes

* rebuilt artifacts ([d20c57e](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/d20c57e9b607d0bbec37c8f62203085e2c6789a7))

### [0.1.15](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/compare/v0.1.14...v0.1.15) (2021-10-25)


### Bug Fixes

* remove unnecessary console.log, remove commented out code ([d5550cb](https://bitbucket.org/calmisland/kidsloop-nodejs-logger/commit/d5550cb2028e6bfd06ba6ceb9274a12c616d9c20))

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
