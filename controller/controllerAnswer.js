const Answer = require('../models/answer');
const Question = require('../models/question');
const Vehicle = require('../models/vehicle');

const createAnswer = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { answer: answerText } = req.body;
        const userId = req.user.userId;

        if (!answerText) return res.status(400).json();

        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json();

        const vehicle = await Vehicle.findById(question.vehicle);
        if (!vehicle) return res.status(404).json();

        if (vehicle.owner.toString() !== userId)  return res.status(403).json();

        if (question.answer) return res.status(400).json();

        const newAnswer = await Answer.create({
            question: questionId,
            user: userId,
            answer: answerText
        });

        await Question.findByIdAndUpdate(questionId, { answer: newAnswer._id});

        const populatedAnswer = await Answer.findById(newAnswer._id).populate("user", "name");


        res.status(201).json({ data: populatedAnswer });
    } catch (error) {
        res.status(500).json();
    }
};

module.exports = {
    createAnswer
};