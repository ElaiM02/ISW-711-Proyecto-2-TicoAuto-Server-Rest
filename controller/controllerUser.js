const User = require('../models/user');
const bcrypt = require('bcrypt');

const PADRON_API = 'http://127.0.0.1:8000';

const userPost = async (req, res) => {
    try {
        const { name, email, password, cedula} = req.body;

        if (!name || !email || !password || !cedula) {
            return res.status(400).json();
        }

        const padronResponse = await fetch(`${PADRON_API}/padron/cedula/${cedula}`);

        if (!padronResponse.ok) {
            return res.status(400).json();
        }

        const person = await padronResponse.json();

        const existingUser = await User.findOne({ $or: [{ email }, { cedula }] });
        if (existingUser) {
            return res.status(400).json();
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            cedula,
            first_lastname: person.first_lastname,
            second_lastname: person.second_lastname
        });

        res.setHeader('Location', `/users/${newUser._id}`);
        return res.status(201).json();
    } catch (error) {
        return res.status(500).json();
    }
};

const userGet = async (req, res) => {
    try {
        if (!req.query.id) {
            const data = await User.find().select('-password');
            return res.status(200).json(data)
        }
        const data = await User.findById(req.query.id).select('-password');
        res.status(200).json(data)
    }
    catch (error) {
        res.status(500).json();
    }
};

module.exports = {
    userPost,
    userGet
};