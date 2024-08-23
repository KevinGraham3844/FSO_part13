const jwt = require('jsonwebtoken');
const router = require('express').Router();

const { SECRET } = require('../util/config');
const { User, Session }= require('../models');

router.delete('/', async (req, res) => {
    const body = req.body;
    const token = req.get('authorization').substring(7);

    const user = await User.findOne({
        where: {
            username: body.username
        },
        include: {
            model: Session,
            attributes: ['active', 'token']
        }
    });
    
    if(!user.session) {
        return res.send('user does not have an active session or is using an expired token').end()
     } else if (user.disabled) {
        return res.send('users actions have been disabled').end()
     } else if (user.session.token !== token) {
        return res.send('user token is expired').end()
    } else {
        const session = await Session.findOne({
            where: {
                userId: user.id
            }
        })
        await session.destroy();
        res.send('successfully logged out')
    }

});

module.exports = router