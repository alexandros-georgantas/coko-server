module.exports = {
  user: {
    type: 'user',
    username: 'testuser',
    password: 'test1234',
  },

  updatedUser: {
    username: 'changeduser',
    password: 'changed',
  },

  otherUser: {
    type: 'user',
    username: 'anotheruser',
    password: 'rubgy',
  },

  localIdentity: {
    name: 'Someone',
    aff: 'University of PubSweet',
    type: 'local',
    email: 'a@b.org',
    confirmationToken: null,
    confirmationTokenTimestamp: null,
    identifier: null,
    oauth: {},
    orcid: null,
  },

  externalIdentity: {
    type: 'external',
    identifier: 'orcid',
    aff: null,
    name: 'External Identity',
    email: 'a@c.org',
    confirmationToken: null,
    confirmationTokenTimestamp: null,
    orcid: null,
    oauth: {
      accessToken: 'someAccessToken',
      refreshToken: 'someRefreshToken',
    },
  },
}
