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
  },

  externalIdentity: {
    type: 'external',
    identifier: 'orcid',
    oauth: {
      accessToken: 'someAccessToken',
      refreshToken: 'someRefreshToken',
    },
  },
}
