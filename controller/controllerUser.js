const e = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');

const userPost = async (req, res) => {
    try {
        const { name, email, password } = req.body;


        if (!name || !email || !password) {
            return res.status(400).json();
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json();
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json();
        res.header('Location', `/users/${newUser._id}`);
        return res.json();
    } catch (error) {
        return res.status(500).json();
    }
};

const userGet = async (req, res) => {
    try {
        if (!req.query.id) {
            const data = await User.find();
            return res.status(200).json(data)
        }
        const data = await User.findById(req.query.id);
        res.status(200).json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
};

module.exports = {
    userPost,
    userGet
};