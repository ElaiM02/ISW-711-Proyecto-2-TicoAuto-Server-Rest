const mongoose = require("mongoose");
const Question = require("../models/question")
const Vehicle = require("../models/vehicle")

const createQuestion = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { question } = req.body;

        const userId = req.user.id || req.user.userId;

        if (!question) {
            return res.status(400).json();
        }

        if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
            return res.status(400).json();
        }

        const vehicle = await Vehicle.findById(vehicleId);

        if (!vehicle) {
            return res.status(404).json();
        }

        const existingQuestion = await Question.findOne({ 
            vehicle: vehicleId, 
            user: userId, 
            answer: null
        });

        if (existingQuestion) {
            return res.status(400).json();
        }

        const newQuestion = await Question.create({
            vehicle: vehicleId,
            user: userId,
            question
        });

        res.status(201).json({ data: newQuestion });
    } catch (error) {
        res.status(500).json();
    }
};

const getQuestionsByVehicle = async (req, res) => { 
  try {
    const { vehicleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json();
    }

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json();
    }

    const userId = req.user?.id || req.user?.userId || null;

    let filter = { vehicle: vehicleId };
    if (userId && vehicle.owner && vehicle.owner.toString() !== userId) {
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
                id: q.id,
                question: q.question,
                answer: q.answer ? { text: q.answer.answer, user: q.answer.user.name, createdAt: q.answer.createdAt } : null,
                user: q.user.name,
                userId: q.user._id,
                createdAt: q.createdAt
            }))
    });

  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};

module.exports = {
    createQuestion,
    getQuestionsByVehicle
};