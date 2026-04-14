const express = require('express');
const router = express.Router();
const { userPost, userGet, userVerify, googleCedula, validarCedula } = require('../controller/controllerUser');
const { authenticateToken } = require('../controller/controllerAuth');

router.post('/users', userPost);
router.get('/users', userGet);
router.get('/users/verify', userVerify);
router.get('/users/cedula/:cedula', validarCedula);
router.post('/users/google/cedula', authenticateToken, googleCedula);
module.exports = router;