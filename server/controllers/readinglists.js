const router = require('express').Router();

const { ReadingList, User } = require('../models');
const { tokenExtractor } = require('../util/middleware');

router.get('/', async (_req, res) => {
    const readingLists = await ReadingList.findAll({
        attributes: { exclude: ['id']}
    });
    res.json(readingLists);
});

router.put('/', tokenExtractor, async (req, res) => {
    const token = req.get('authorization').substring(7);
    const user = await User.findByPk(req.decodedToken.id, {
        include: {
            model: Session,
            attributes: ['active', 'token']
        }
    });
    const reading = await ReadingList.findOne({
        where: { 
            blogId: req.body.blogId,
            userId: req.decodedToken.id
        }
    })
    if (!user.session) {
        res.send('user does not have an active session').end()
    } else if (user.disabled) {
        res.send('users actions have been disabled').end()
    } else if (user.session.token !== token) {
        res.send('user token is expired')
    } else if (reading) {
        reading.read = req.body.read;
        await reading.save();
        res.send('completed change to read');
    } else {
        res
            .status(404)
            .send('this blog is not in your list')
            .end();
    }
});

module.exports = router;
