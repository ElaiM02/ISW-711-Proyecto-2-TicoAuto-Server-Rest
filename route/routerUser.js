const express = require('express');
const router = express.Router();
const { userPost, userGet, userVerify, googleCedula } = require('../controller/controllerUser');
const { authenticateToken } = require('../controller/controllerAuth');

router.post('/users', userPost);
router.get('/users', userGet);
router.get('/users/verify', userVerify);
router.post('/users/google/cedula', authenticateToken, googleCedula);
module.exports = router;