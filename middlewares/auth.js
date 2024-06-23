const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const verifyAdmin = async (req, res, next) => {
    verifyToken(req, res, async () => {
        const user = await User.findById(req.user);
        if (user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
        next();
    });
};

module.exports = { verifyToken, verifyAdmin };