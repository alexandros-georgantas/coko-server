This package extends pubsweet's server with a few extra features, so that it can be used by coko-developed apps.

It is also meant to bundle as many server-side pubsweet dependencies as possible into one package, ensuring that the versions of those dependencies will play nice with each other.

## Get started

Install package and remove the dependencies it is meant to replace.

```sh
yarn remove pubsweet pubsweet-server # if migrating from an existing project
yarn add @coko/server
```

Add a central server file to your app.

```js
// server/app.js

// This is the express app your app will use
const { app } = require('@coko/server')

// You can modify the app or ensure other things are imported here

module.exports = app
```

If you place this file in `server/app.js`, starting the server should work automatically. If you wish to have a custom location for this file, you can declare that in your config.

```js
// config/default.js
{
  'pubsweet-server': {
    // replace helpers/customApp.js with your file's location
    app: path.resolve(__dirname, 'helpers', 'customApp.js'),
  }
}
```

### Cron support

All you need for cron-based scheduled tasks to run is to provide the path to your cron jobs.

```js
// config/default.js
{
  'pubsweet-server': {
    // replace server/services/cron with your folder's or file's location
    cron: {
      path: path.join(__dirname, '..', 'server', 'services', 'cron'),
    },
  }
}
```

A simple cronjob could look like this:

```js
const { cron } = require('@coko/server')

// Log this every second
cron.schedule('* * * * * *', () => {
  console.log('this is the simplest thing')
})
```

The library that enables this is `node-cron`. Be sure to check its [documentation](https://github.com/node-cron/node-cron#node-cron) for further details.

### Other exports from included packages

- `createJWT` is an export of a function in `pubsweet-server` that does just that. Useful if you have custom login resolvers.

### Future features

- Graphql middleware
- Include more pubsweet packages into the bundle
