const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim:true,
    },
    password: {
        type: String,
        required: true,
        trim:true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
