const jwt = require('jsonwebtoken');
require('dotenv').config();

// Simulación de una base de datos de usuarios
let users = [];

const registerUser = (username, password) => {
    const user = { id: users.length + 1, username, password };
    users.push(user);
    return user;
};

const findUser = (username) => {
    return users.find(user => user.username === username);
};

const generateToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { registerUser, findUser, generateToken };
