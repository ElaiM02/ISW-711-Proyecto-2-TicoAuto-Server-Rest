require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('./config/passport');

const { generateToken, verify2FA } = require('./controller/controllerAuth');

const app = express();

app.use(helmet({crossOriginResourcePolicy: { policy: "cross-origin" }}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

//middlewares
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cors({ origin: '*', methods: '*' }));
app.use('/uploads', express.static('uploads'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

//auth route
app.post('/auth/token', generateToken);
app.use('/auth', require('./route/routerAuth'));
app.post('/auth/2fa', verify2FA);

//route
app.use('/api', require('./route/routerUser'));
app.use('/api', require('./route/routerVehicle'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json();
});

const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error);
    process.exit(1);
});

database.once('connected', () => {
    console.log('Database Connected');
    app.listen(3008, () => console.log('UTN API service listening on port 3008!'));
});

mongoose.connect(process.env.DATABASE_URL);