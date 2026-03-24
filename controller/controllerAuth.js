const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json();
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json();
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json();
        }

        const payload = { userId: user._id, email: user.email };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        return res.status(201).json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json();
    }
};

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {

        const payload = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(payload.userId);
        req.user = user;
        next();
    } catch (error) {
                console.error("JWT ERROR:", error);

        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = {
    generateToken,
    authenticateToken
};