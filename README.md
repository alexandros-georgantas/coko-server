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

### Authorization middleware

The server provides authorization checks through using `graphql-shield`.  
You can access all of shield's exports (eg. `rule`, `and`, `or` etc.) through `@coko/server/authorization`.  
The only exception is `shield`, which is used internally by the server.
Besides shield's exports, two helpers, `isAdmin` and `isAuthenticated` are provided.

To get started, declare your permissions in any file you want:

```js
// myPermissions.js

const { rule } = require('@coko/server/authorization')

const permissions = {
  Query: {
    myQuery: rule()(async (parent, args, ctx, info) => {
      // my auth logic here
    }),
    // using provided helpers
    anotherQuery: isAdmin,
    yetAnotherQuery: isAuthenticated,
  },
  Mutation: {
    myMutation: rule()(async (parent, args, ctx, info) => {
      // my other auth logic here
    }),
  },
}

module.exports = permissions
```

For the server to access your permissions, simply add them to the config:

```js
// config/default.js

const permissions = require('../path/to/myPermissions.js')

{
  permissions: permissions
}
```

Please refer to shield's [documentation](https://github.com/maticzav/graphql-shield#overview) for more details.

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

### CORS support for the client

If you run your client on a different host/port than the server, you might run into issues where cross-origin requests are rejected. If that happens, make sure the following entries exist in your config. The server should take care of it once these are defined.

```js
// replace values with the ones you are using
{
  'pubsweet-client': {
    host: 'http://localhost',
    port: 4000,
  }
}
```

### Other exports from included packages

- `createJWT` is an export of a function in `pubsweet-server` that does just that. Useful if you have custom login resolvers.

### Future features

- Notification middleware
- Include more pubsweet packages into the bundle
