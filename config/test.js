module.exports = {
  'pubsweet-server': {
    logger: {
      info: () => {},
      error: () => {},
      debug: () => {},
      warn: () => {},
    },
  },
  integrations: {
    test: {
      clientId: 'ketida-editor',
      redirectUrl: 'http://localhost:4000/provider-connection-popup/dummy',
      tokenUrl: 'http://example.com',
    },
  },
}
