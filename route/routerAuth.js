const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/google/error' }),
    async (req, res) => {
        const user = req.user;
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        if (user.status === 'pending_cedula') {
            return res.redirect(`${process.env.FRONTEND_URL}/google-cedula.html?token=${token}`);
        }

        return res.redirect(`${process.env.FRONTEND_URL}/google-callback.html?token=${token}`);
    }
);

module.exports = router;