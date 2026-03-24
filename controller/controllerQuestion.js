const mongoose = require("mongoose");
const Question = require("../models/question")
const Vehicle = require("../models/vehicle")

const createQuestion = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { question } = req.body;

        const userId = req.user.id || req.user.userId;

        if (!question) {
            return res.status(400).json({ message: error.message });
        }

        if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
            return res.status(400).json({ message: error.message });
        }

        const vehicle = await Vehicle.findById(vehicleId);

        if (!vehicle) {
            return res.status(404).json({ message: error.message });
        }

        const existingQuestion = await Question.findOne({ 
            vehicle: vehicleId, 
            user: userId, 
            answer: null
        });

        if (existingQuestion) {
            return res.status(400).json({ message: "Ya has hecho una pregunta sin respuesta para este vehículo" });
        }

        const newQuestion = await Question.create({
            vehicle: vehicleId,
            user: userId,
            question
        });;

        res.status(201).json({ message: "Pregunta creada exitosamente", data: newQuestion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQuestionsByVehicle = async (req, res) => { 
  try {
    const { vehicleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    const userId = req.user.id || req.user.userId;

    let filter = { vehicle: vehicleId };
    if (vehicle.owner.toString() !== userId) {
      filter.user = userId;
    }

    const questions = await Question.find(filter)
      .populate("user", "name")
      .populate({
        path: "answer",
        populate: { 
          path: "user", 
          select: "name" 
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      total: questions.length,
      data: questions.map(q => ({
                id: q._id,
                question: q.question,
                answer: q.answer ? { text: q.answer.answer, user: q.answer.user.name } : null,
                user: q.user.name,
                userId: q.user._id,
                createdAt: q.createdAt
            }))
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    createQuestion,
    getQuestionsByVehicle
};