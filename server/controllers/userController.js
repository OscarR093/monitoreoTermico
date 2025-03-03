const { registerUser, findUser, generateToken } = require('../models/userModel');

exports.register = (req, res) => {
    const { username, password } = req.body;
    const user = registerUser(username, password);
    res.status(201).json({ message: 'Usuario registrado', user });
};

exports.login = (req, res) => {
    const { username, password } = req.body;
    const user = findUser(username);

    if (user && user.password === password) {
        const token = generateToken(user);
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Credenciales inválidas' });
    }
};

exports.getProfile = (req, res) => {
    res.json({ user: req.user });
};
