const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const ModelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 20
    },
    username: {
        type: String,
        required: true,
        unique: true,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
    },
    about: {
        type: String,
        maxlength: 100,
        default: 'أهلًا، أنا أستعمل محادثة حسوب'
    },
    avatar: {
        type: String
    },
    status: {
        type: Number
    }
})

ModelSchema.pre('save', function(next) {
    if(this.isNew || this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password, 8)
    }
    next()
})

ModelSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

ModelSchema.set('toJSON', {
    virtuals: true
});

ModelSchema.methods.getData = function() {
    return {
        id: this._id,
        name: this.name,
        username: this.username,
        about: this.about,
        avatar: this.avater,
        status: this.status
    }
}

ModelSchema.methods.signJwt = function() {
    let data = this.getData()
    data.token = jwt.sign(data, process.env.JWT_SECRET)
    return data
}

ModelSchema.methods.checkPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

const Model = mongoose.model('User', ModelSchema)

module.exports = Model