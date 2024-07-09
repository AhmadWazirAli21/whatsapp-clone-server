const User = require('../models/user')

exports.login = async (req, res, next) => {
    const { username, password } = req.body
    await User.findOne({username})
    .then(user => {
        if(!user || !user.checkPassword(password)) {
            return res.status(401).json({message: "الرجاء التحقق من اسم المستخدم او كلمة السر"})
        }
        return res.json(user.signJwt())
    })
    .catch(next)
}

exports.register = async (req, res, next) => {
    let data = { name, username, password } = req.body
    await User.findOne({username})
    .then( async user => {
        if(user) return res.status(422).json({message:'اسم المستخدم موجود مسبقا'})
        return await User.create(data);
    })
    .then(user => {
        res.json(user.signJwt());
        sendNewUser(user)
    })
    .catch(next);
}

const sendNewUser = user => {
    let data = { name, username, avatar } = user
    io.emit('new_user', data)
}