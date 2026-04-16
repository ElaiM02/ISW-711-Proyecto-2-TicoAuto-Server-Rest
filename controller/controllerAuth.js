const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error(message = error.message);
}

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const generateToken = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json();
    }

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json();
        }

        if (user.status === 'pending') {
            return res.status(403).json();
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json();
        }

         const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

        user.twoFactorCode = code;
        user.twoFactorExpiration = expires;
        await user.save();

        await twilioClient.messages.create({
            body: `Tu código de verificación de TicoAuto es: ${code}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: user.phone
        });

        return res.status(200).json({ requires2FA: true });

    } catch (error) {
        console.error(error);
        return res.status(500).json();
    }
};

const verify2FA = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json();
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json();
        }

        if (user.twoFactorCode !== code) {
            return res.status(401).json();
        }

        if (user.twoFactorExpiration < new Date()) {
            return res.status(401).json();
        }

        user.twoFactorCode = null;
        user.twoFactorExpiration = null;
        await user.save();

        const payload = { userId: user._id, email: user.email };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ token });

    } catch (error) {
        console.error(error);
        return res.status(500).json();
    }
};


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json();
    }

    try {

        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (error) {
                console.error("JWT ERROR:", error);

        return res.status(403).json();
    }
};

module.exports = {
    generateToken,
    verify2FA,
    authenticateToken
};