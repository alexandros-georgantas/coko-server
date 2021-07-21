module.exports = {
    user: {
      type: 'user',
      username: 'testuser',
      password: 'test1234',
    },
    userWithInvalidPassword: {
      type: 'user',
      username: 'testuser',
      password: '1234',
    },
    userWithFullName: {
      type: 'user',
      username: 'testuser',
      password: 'test1234',
      givenNames: 'Sam',
      surname: 'Something',
    },
    userWithoutName: {
      type: 'user',
      password: 'test1234',
    },
    updatedUser: {
      username: 'changeduser',
      password: 'changed',
    },
    otherUser: {
      type: 'user',
      username: 'anotheruser',
      password: 'rubgy9876',
    },
  }
  