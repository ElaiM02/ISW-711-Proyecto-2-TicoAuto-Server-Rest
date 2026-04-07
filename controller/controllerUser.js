const User = require('../models/user');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const PADRON_API = 'http://127.0.0.1:8000';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify.html?token=${token}`;

    await transporter.sendMail({
        from: `"TicoAuto" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verifica tu cuenta - TicoAuto',
        html: `
            <h2>Bienvenido a TicoAuto</h2>
            <p>Gracias por registrarte. Por favor verifica tu cuenta haciendo clic en el siguiente enlace:</p>
            <a href="${verificationUrl}" style="
                background-color: #3b82f6;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
                margin-top: 10px;
            ">Verificar cuenta</a>
            <p>Si no creaste esta cuenta, ignora este correo.</p>
        `
    });
};

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
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            cedula,
            first_lastname: person.primer_apellido,
            second_lastname: person.segundo_apellido,
            status: 'pending',
            verificationToken
        });

        await sendVerificationEmail(email, verificationToken);

        res.setHeader('Location', `/users/${newUser._id}`);
        return res.status(201).json();
    } catch (error) {
        console.error(error);
        return res.status(500).json();
    }
};

const userVerify = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json();
        }

        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json();
        }

        user.status = 'active';
        user.verificationToken = null;
        await user.save();

        return res.status(200).json();

    } catch (error) {
        console.error(error);
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
    userVerify,
    userGet
};