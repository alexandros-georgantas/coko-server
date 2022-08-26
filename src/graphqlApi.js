const createGraphQLServer = require('./graphqlServer')

const api = app => {
  app.use(
    '/graphql',
    app.locals.passport.authenticate(['bearer', 'anonymous'], {
      session: false,
    }),
  )

  const server = createGraphQLServer()
  server.applyMiddleware({ app })
}

module.exports = api
