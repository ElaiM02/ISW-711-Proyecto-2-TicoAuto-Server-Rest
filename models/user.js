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
        required: true,
        unique: true,
        trim: true
    },
    first_lastname: {
        type: String,
        required: true,
    },
    second_lastname: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'active'],
        default: 'pending'
    },
    verificationToken: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);