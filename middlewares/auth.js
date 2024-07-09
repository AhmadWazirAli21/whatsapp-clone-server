const User = require('../models/user')
const jwt = require('jsonwebtoken')
const createError = require('http-errors')

exports.socket = (socket, next) => {
  if(!socket.handshake.query || !socket.handshake.query.token){
    return next(createError(401, 'auth_error'))
  }

  jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, (err, decoded) => {
    if(err) return next(createError(401, 'auth_error'))
    User.findById(decoded.id)
    .then(user => {
      if(!user) return next(createError(401, 'auth_error'))

      socket.user = user
      next()
    })
    .catch(next)
  })
}

exports.authenticated  = (req, res, next) => {
let token = req.headers['authorization'];
jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(err) return res.status(401).json({message: 'auth error 1'})
    User.findById(decoded.id).then(user => {
        if(!user) return res.status(401).json({message: 'auth error 2'})
        req.user = user;
        next();
    }).catch(next);
});
};