const BaseModel = require('./BaseModel')
const ChatMessage = require('./chatMessage/chatMessage.model')
const ChatThread = require('./chatThread/chatThread.model')
const Team = require('./team/team.model')
const TeamMember = require('./teamMember/teamMember.model')
const Identity = require('./identity/identity.model')
const User = require('./user/user.model')

module.exports = {
  BaseModel,
  ChatMessage,
  ChatThread,
  Team,
  TeamMember,
  Identity,
  User,
}
