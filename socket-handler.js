io = require('socket.io')();

const auth = require('./middlewares/auth')
const Message = require('./models/message')
const User = require('./models/user')

io.use(auth.socket)

io.on('connection', socket => {
  initialData(socket)
  onSocketConnected(socket)
  socket.on('message', (data) => onMessage(socket, data))
  socket.on('disconnect', () => onSocketDisconnected(socket))
  socket.on('typing', receiver => onTyping(socket, receiver))
  socket.on('seen', sender => onSeen(socket, sender))
})

async function onSocketConnected(socket) {
  socket.join(socket.user.id)
  let room = io.sockets.adapter.rooms[socket.user.id]
  if (!room || room.length === 1) {
    await User.updateOne({username: socket.user.username}, {status: true})
    await socket.broadcast.emit('user_status', {
      [socket.user.id]: true
    })
  }
  console.log('New client connected: ' + socket.user.username + ' |id: ' + socket.user.id)
}

async function onSocketDisconnected(socket) {
  let room = io.sockets.adapter.rooms[socket.user.id]
  if(!room || room.length < 1) {
    let lastSeen = new Date().getTime()
    await User.updateOne({username: socket.user.username}, {status: lastSeen})
    await socket.broadcast.emit('user_status', { 
      [socket.user.id]: lastSeen
    })
  }
  console.log('Client disconnected: '+ socket.user.username + ' |id: ' + socket.user.id)
}

async function onMessage(socket, data) {
  let sender = socket.user.id
  let receiver = data.receiver
  let message = {
    sender: sender, receiver: receiver, content: data.content, date: new Date().getTime()
  }
  await Message.create(message)
  io.to(sender).to(receiver).emit('message', message)
}

async function onSeen(socket, sender) {
  let receiver = socket.user.id
  await Message.updateMany({sender, receiver, seen: false}, {seen: true}, {multi: true})
}

function onTyping(socket, receiver) {
  let sender = socket.user.id
  io.to(receiver).emit('typing', sender)
}

const getMessages = async userId => {
  let where = [
    {sender: userId}, {receiver: userId}
  ]
  return await Message.find().or(where)
}

const getUsers = async userId => {
  let where = {
    _id: {$ne: userId}
  }
  return await User.find(where).select('-password')
}

const initialData = socket => {
  let user = socket.user
  let messages = []
  getMessages(user.id)
  .then(data => {
    messages = data
    return getUsers(user.id)
  })
  .then(contacts => {
    socket.emit('data', user, contacts, messages)
  })
  .catch(() => socket.disconnect())
}