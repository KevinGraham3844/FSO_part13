const logger = require('./logger');
const jwt = require('jsonwebtoken');
const { SECRET } = require('./config.js')

const unknownEndpoint = (_req, res) => {
    res.status(404).send( { error: 'unknown endpoint' });
}

const errorHandler = (err, _req, res, next) => {
    logger.error("error handler caught the error:", err.name);
    
    if (err.name === 'SequelizeDatabaseError') {
        if (err.message.includes('invalid input syntax for type integer')) {
            return res.status(400).json({ error: 'likes added must be a valid integer'});
        }
        return res.json({ error: err.message});
    }
    if (err.name === 'SequelizeValidationError') {
        if (err.message.includes('cannot be null')) {
            return res.status(400).json({ error: 'all fields for url/title must be filled out' });
        } else if (err.message.includes('isEmail')) {
            return res.status(400).json({ error: "username must be a valid Email address"})
        }
        return res.status(400).json({ error: err.message });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(400).json({ error: "token invalid" })
    }

    next(err);
}

const tokenExtractor = (req, res, next) => {
    const authorization = req.get('authorization');
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } else {
        return res.status(401).json({ error: 'token missing' });
    }
    next();
}

module.exports = {
    unknownEndpoint,
    errorHandler,
    tokenExtractor
    
}