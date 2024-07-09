const mongoose = require('mongoose');

const ModelSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    seen: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
})

ModelSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

const Model = mongoose.model('Message', ModelSchema)

module.exports = Model