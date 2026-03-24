const express = require('express');
const router = express.Router();
const { userPost, userGet } = require('../controller/controllerUser');

router.post('/users', userPost);
router.get('/users', userGet);
module.exports = router;