const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../controller/controllerAuth');
const vehicleController = require('../controller/controllerVehicle');
const controllerQuestion = require('../controller/controllerQuestion');
const controllerAnswer = require('../controller/controllerAnswer');

const upload = require('../middleware/upload');

// Vehicles
router.get('/vehicles', vehicleController.getVehicles);
router.get('/vehicles/me', authenticateToken, vehicleController.getMyVehicles);
router.get('/vehicles/:id', vehicleController.getVehicleById);
router.patch('/vehicles/:id', authenticateToken, upload.single('image'), vehicleController.updateVehicle);
router.delete('/vehicles/:id', authenticateToken, vehicleController.deleteVehicle);
router.post('/vehicles', authenticateToken, upload.single('image'), vehicleController.createVehicle);

// Questions
router.post('/vehicles/:vehicleId/questions', authenticateToken, controllerQuestion.createQuestion);
router.get('/vehicles/:vehicleId/questions', authenticateToken, controllerQuestion.getQuestionsByVehicle);

// Answers
router.post('/questions/:questionId/answers', authenticateToken, controllerAnswer.createAnswer);

module.exports = router;