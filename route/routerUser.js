const express = require('express');
const router = express.Router();
const { userPost, userGet, userVerify } = require('../controller/controllerUser');

router.post('/users', userPost);
router.get('/users', userGet);
router.get('/users/verify', userVerify);

module.exports = router;