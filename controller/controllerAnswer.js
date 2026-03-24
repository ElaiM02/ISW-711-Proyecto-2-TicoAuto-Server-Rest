const Answer = require('../models/answer');
const Question = require('../models/question');
const Vehicle = require('../models/vehicle');

const createAnswer = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { answer: answerText } = req.body;

        const userId = req.user.id || req.user.userId;

        if (!answerText) {
            return res.status(400).json({ message: "La respuesta es requerida" });
        }

        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({ message: "Pregunta no encontrada" });
        }

        const vehicle = await Vehicle.findById(question.vehicle);

        if (!vehicle) {
            return res.status(404).json({ message: "Vehículo no encontrado" });
        }

        if (vehicle.owner.toString() !== userId) {
            return res.status(403).json({ message: "No tienes permiso para responder esta pregunta" });
        }

    if (question.answer) {
        return res.status(400).json({ message: "Esta pregunta ya ha sido respondida" });
    }

        const newAnswer = await Answer.create({
            question: questionId,
            user: userId,
            answer: answerText
        });

        await Question.findByIdAndUpdate(questionId, {
            answer: newAnswer._id
        });

        const populatedAnswer = await Answer.findById(newAnswer._id).populate("user", "name");


        res.status(201).json({ message: "Respuesta creada exitosamente", data: populatedAnswer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAnswer
};