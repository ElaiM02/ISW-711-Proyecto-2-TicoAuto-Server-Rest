const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer',
        default: null
    }

    }, {
        timestamps: true
    }
);

module.exports = mongoose.model('Question', questionSchema);