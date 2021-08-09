# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.15.3](https://gitlab.coko.foundation/cokoapps/server/compare/v1.15.2...v1.15.3) (2021-08-09)


### Bug Fixes

* **middleware:** server host variable should not be needed in prod ([20fac01](https://gitlab.coko.foundation/cokoapps/server/commit/20fac016145814c2657e7a4fd1c7754af003735b))

### [1.15.2](https://gitlab.coko.foundation/cokoapps/server/compare/v1.15.1...v1.15.2) (2021-08-09)


### Bug Fixes

* **middleware:** allow shield errors ([b35f111](https://gitlab.coko.foundation/cokoapps/server/commit/b35f11132bf7c3221c6233e38a17844491d5a22c))

### [1.15.1](https://gitlab.coko.foundation/cokoapps/server/compare/v1.15.0...v1.15.1) (2021-06-11)


### Bug Fixes

* **server:** do not allow gql playground in production ([30f10d0](https://gitlab.coko.foundation/cokoapps/server/commit/30f10d0ac928880764e4bdc81055b83ffe97ba8d))

## [1.15.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.14.0...v1.15.0) (2021-05-25)


### Features

* **server:** expose req & res in graphql context ([7a78b77](https://gitlab.coko.foundation/cokoapps/server/commit/7a78b77f1f4fc1cb46831b688aad5aeeb9c6f2c7))

## [1.14.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.13.0...v1.14.0) (2021-04-19)


### Features

* **server:** add uuid helper ([62a04de](https://gitlab.coko.foundation/cokoapps/server/commit/62a04de4c0fa569bf88ac4571ac55b858ba12532))


### Bug Fixes

* fix useTransaction base model import ([a06af0f](https://gitlab.coko.foundation/cokoapps/server/commit/a06af0fe85a65d2eee3dfa41950e3b3397bf838d))

## [1.13.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.12.2...v1.13.0) (2021-04-10)


### Features

* **server:** add useTransaction ([d33b2f2](https://gitlab.coko.foundation/cokoapps/server/commit/d33b2f24b0a6e197410b1f96949a8a1455fcf2c4))

### [1.12.2](https://gitlab.coko.foundation/cokoapps/server/compare/v1.12.1...v1.12.2) (2021-03-30)


### Bug Fixes

* **server:** fix mailer config issue ([07c6a02](https://gitlab.coko.foundation/cokoapps/server/commit/07c6a02531751037e1b185c4f2bdf56c3226acfa))

### [1.12.1](https://gitlab.coko.foundation/cokoapps/server/compare/v1.12.0...v1.12.1) (2021-03-29)


### Bug Fixes

* **server:** server should not crash without mailer config ([62b9d7f](https://gitlab.coko.foundation/cokoapps/server/commit/62b9d7f9259a4723ca5ba08207ddb3484a40883a))

## [1.12.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.11.0...v1.12.0) (2021-03-23)


### Features

* **server:** include send email component & update docs ([8dc9faa](https://gitlab.coko.foundation/cokoapps/server/commit/8dc9faae2f85bd462c3b4dbc90ad126a0a6584c6))

## [1.11.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.10.0...v1.11.0) (2021-03-18)


### Features

* **server:** export db from db-manager ([6524687](https://gitlab.coko.foundation/cokoapps/server/commit/652468782a52c5940807598a4eef75a59d4d135c))

## [1.10.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.9.1...v1.10.0) (2021-03-18)


### Features

* **server:** expose pubsubmanager from ps-server ([0f5db7e](https://gitlab.coko.foundation/cokoapps/server/commit/0f5db7e08909539ef92adf74e79ff1db30ca6014))

### [1.9.1](https://gitlab.coko.foundation/cokoapps/server/compare/v1.9.0...v1.9.1) (2021-03-10)


### Bug Fixes

* **server:** fix pg-boss version mismatch ([b27496e](https://gitlab.coko.foundation/cokoapps/server/commit/b27496e4ada78d51df1b40642277d9d781fb9034))

## [1.9.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.8.0...v1.9.0) (2021-03-03)


### Features

* **server:** expose pg-boss from ps-server ([ed611f7](https://gitlab.coko.foundation/cokoapps/server/commit/ed611f71927cc64b9b5b7e936a326a0e2e5185fc))


### Bug Fixes

* **server:** add error handling for graphql errors ([358d8fa](https://gitlab.coko.foundation/cokoapps/server/commit/358d8fafd9638afa993bd9a5e76acd3c8c2275f0))

## [1.8.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.7.1...v1.8.0) (2020-12-09)


### Features

* **server:** add ability to turn off pg-boos job queue ([35a56f1](https://gitlab.coko.foundation/cokoapps/server/commit/35a56f1f81b4bf3c276595e7525ea7e6648ce305))
* **server:** add health check endpoint ([a03a4cb](https://gitlab.coko.foundation/cokoapps/server/commit/a03a4cb9c1cd1dce84949ed58011019acc08c3ca))

### [1.7.1](https://gitlab.coko.foundation/cokoapps/server/compare/v1.7.0...v1.7.1) (2020-12-08)


### Bug Fixes

* **server:** fix bundle serving path ([71812d4](https://gitlab.coko.foundation/cokoapps/server/commit/71812d499572af0396be4736e09d27a4f578c68c))

## [1.7.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.6.3...v1.7.0) (2020-12-08)


### Features

* **server:** add env variable that will serve build ([e1bec79](https://gitlab.coko.foundation/cokoapps/server/commit/e1bec79db9c972ac9bd9edf0e9cdc58934603727))

### [1.6.3](https://gitlab.coko.foundation/cokoapps/server/compare/v1.6.2...v1.6.3) (2020-11-23)


### Bug Fixes

* **server:** handle client protocol and port not being defined ([a100b6b](https://gitlab.coko.foundation/cokoapps/server/commit/a100b6ba705e575cb200833fdf9ba8818861786f))

### [1.6.2](https://gitlab.coko.foundation/cokoapps/server/compare/v1.6.1...v1.6.2) (2020-11-23)


### Bug Fixes

* **server:** serve static folder from server ([e565522](https://gitlab.coko.foundation/cokoapps/server/commit/e565522b078c9396dede7815845d05731499d643))

### [1.6.1](https://gitlab.coko.foundation/cokoapps/server/compare/v1.6.0...v1.6.1) (2020-11-20)


### Bug Fixes

* **server:** make 0.0.0.0 be set as localhost for CORS setup ([ca2673b](https://gitlab.coko.foundation/cokoapps/server/commit/ca2673bdd3218d41e8b1bdadedd0c37d2abb7174))

## [1.6.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.5.0...v1.6.0) (2020-11-20)


### Features

* **server:** allow server to read broken down client url for cors ([a3997b7](https://gitlab.coko.foundation/cokoapps/server/commit/a3997b770883a53197686e98a6d7b30a21d67100))

## [1.5.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.4.1...v1.5.0) (2020-11-16)


### Features

* **server:** export startServer function from pubsweet ([e43dd53](https://gitlab.coko.foundation/cokoapps/server/commit/e43dd53f16ab90060cd7d4482c982870878ee490))

### [1.4.1](https://gitlab.coko.foundation/cokoapps/server/compare/v1.4.0...v1.4.1) (2020-10-27)


### Bug Fixes

* **server:** do not load subscriptions if gql is off ([b7359ae](https://gitlab.coko.foundation/cokoapps/server/commit/b7359ae67a5630581df35e77202e792dcfe42915))

## [1.4.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.3.0...v1.4.0) (2020-10-26)


### Features

* **middleware:** enable shield debug mode when not in production ([fa2ce20](https://gitlab.coko.foundation/cokoapps/server/commit/fa2ce20327724f75b877adbea28d18fd9d285f75))
* **server:** add ability to disable server ([4d89db0](https://gitlab.coko.foundation/cokoapps/server/commit/4d89db0b9832328e45801cb63ef4bfe9f77aca7a))

## [1.3.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.2.0...v1.3.0) (2020-06-13)


### Features

* **middleware:** add email middleware ([f0e6fb9](https://gitlab.coko.foundation/cokoapps/server/commit/f0e6fb9456f33e12be84181f2f70bf430f242399))

## [1.2.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.1.0...v1.2.0) (2020-05-28)


### Features

* **server:** export BaseModel ([82e7cd5](https://gitlab.coko.foundation/cokoapps/server/commit/82e7cd5c4de4d0b9e0017c24a52fee0cb36bdc62))
* **server:** export logger ([a3dfd2b](https://gitlab.coko.foundation/cokoapps/server/commit/a3dfd2b0df720cbb96c71c5c95977625058f97dc))

## [1.1.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.0.0...v1.1.0) (2020-05-20)


### Features

* **middleware:** add helpers for authorization middleware ([f17b265](https://gitlab.coko.foundation/cokoapps/server/commit/f17b2655d50764289a88e4fae5852f302e4bddc0))


### Bug Fixes

* **middleware:** ensure rules are not empty before applying shield ([557dc56](https://gitlab.coko.foundation/cokoapps/server/commit/557dc56dc2cf5d628aeca56422e8a78b61dd8c90))

## [1.0.0](https://gitlab.coko.foundation/cokoapps/server/compare/v0.1.0...v1.0.0) (2020-05-11)


### Features

* **middleware:** add middleware for authorization ([33659f4](https://gitlab.coko.foundation/cokoapps/server/commit/33659f424453f19f45f90eade432bc0df207e06c))


### Bug Fixes

* **server:** fix crash when trying to read empty config values ([c6c07e4](https://gitlab.coko.foundation/cokoapps/server/commit/c6c07e46141156a39c7e875223798303ea70e776))

## [0.1.0](https://gitlab.coko.foundation/cokoapps/server/compare/v0.0.2...v0.1.0) (2020-04-04)


### Features

* **server:** cors config to allow client running on a different port ([dff70dd](https://gitlab.coko.foundation/cokoapps/server/commit/dff70dd2623adc3855129f1e98ba1cda68f37a0d))

### [0.0.2](https://gitlab.coko.foundation/cokoapps/server/compare/v0.0.1...v0.0.2) (2020-03-28)


### Features

* bundle pubsweet cli with package ([0c4b206](https://gitlab.coko.foundation/cokoapps/server/commit/0c4b2060a6f453a12408bdb786967b6d709c2220))
* **server:** add cron support ([dcd352a](https://gitlab.coko.foundation/cokoapps/server/commit/dcd352ade1cc96583a1d86366fcc0a21aee77961))


### Bug Fixes

* **server:** resolve circular dependencies & make passport auth work ([5dffd0f](https://gitlab.coko.foundation/cokoapps/server/commit/5dffd0fbd65753181b4ac171cac40dd1b10df234))

### 0.0.1 (2020-03-27)


### Features

* **server:** export express app ([bdbab7d](https://gitlab.coko.foundation/cokoapps/server/commit/bdbab7d71d1ba8518ab40f60a8869975adf5dff8))
