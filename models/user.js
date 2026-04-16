const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    cedula: {
        type: String,
        default: 'null',
        unique: true,
        trim: true
    },
    first_lastname: {
        type: String,
        default: 'null',

    },
    second_lastname: {
        type: String,
        default: 'null'
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'pending_cedula'],
        default: 'pending'
    },
    verificationToken: {
        type: String,
        default: null
        },
    googleId: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null,
    },
    twoFactorCode: {
        type: String,
        default: null
    },
    twoFactorExpiration: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);