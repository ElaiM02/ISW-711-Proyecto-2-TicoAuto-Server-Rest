const User = require('../models/user');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const crypto = require('crypto');

const PADRON_API = 'http://127.0.0.1:8000';

const validarCedula = async (req, res) => {
    try {
        const { cedula } = req.params;

        if (!cedula || cedula.length !== 9 || !cedula.match(/^\d+$/)) {
            return res.status(400).json();
        }

        const padronResponse = await fetch(`${PADRON_API}/padron/cedula/${cedula}`);

        if (!padronResponse.ok) {
            return res.status(404).json();
        }

        const person = await padronResponse.json();

        return res.status(200).json({
            nombre: person.nombre,
            primer_apellido: person.primer_apellido,
            segundo_apellido: person.segundo_apellido
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json();
    }
};

const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify.html?token=${token}`;

    const result = await sgMail.send({
        from: 'eliamestudio@gmail.com',
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

    console.log('SendGrid result:', result[0].statusCode);
};

const userPost = async (req, res) => {
    try {
        const { name, email, password, cedula, phone} = req.body;
        console.log('Datos recibidos:', { name, email, cedula, phone });

        if (!name || !email || !password || !cedula || !phone) {
            return res.status(400).json();
        }

        const padronResponse = await fetch(`${PADRON_API}/padron/cedula/${cedula}`);

        if (!padronResponse.ok) {
            return res.status(400).json();
        }

        const person = await padronResponse.json();

        const existingUser = await User.findOne({ $or: [{ email }, { cedula }] });
        if (existingUser) {
            return res.status(409).json();
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            cedula,
            phone,
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

const googleCedula = async (req, res) => {
    try {
        const { cedula } = req.body;
        const userId = req.user.userId;

        if (!cedula) {
            return res.status(400).json();
        }

        const existingCedula = await User.findOne({ cedula });
        if (existingCedula) {
            return res.status(409).json();
        }

        const padronResponse = await fetch(`${PADRON_API}/padron/cedula/${cedula}`);
        if (!padronResponse.ok) {
            return res.status(400).json();
        }

        const person = await padronResponse.json();

        await User.findByIdAndUpdate(userId, {
            name: person.nombre,
            cedula,
            first_lastname: person.primer_apellido,
            second_lastname: person.segundo_apellido,
            status: 'active'
        });

        return res.status(200).json();

    } catch (error) {
        console.error(error);
        return res.status(500).json();
    }
};

module.exports = {
    userPost,
    userVerify,
    userGet,
    googleCedula,
    validarCedula
};