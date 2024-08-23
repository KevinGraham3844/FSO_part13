const router = require('express').Router();

const { User, Blog, Session } = require('../models');

router.get('/', async (_req, res) => {
    const users = await User.findAll({
        include: {
            model: Blog,
            attributes: { exclude: ['userId'] }
        },
        
    });
    res.json(users);
});

router.get('/:username', async (req, res) => {
    
    const user = await User.findOne({
        where: {
            username: req.params.username
        }
    });
    if (user) {
        res.json(user);
    } else {
        res.status(404).end();
    }
});

router.get('/id/:id', async (req, res) => {

    const where = {};

    if (req.query.read) {
        where.read = req.query.read === 'true';
    }

    const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['createdAt', 'updatedAt', 'id' ]},
        include: [
            {
                model: Blog,
                as: 'readings',
                attributes: { exclude: ['userId']},
                through: {
                    attributes: ['read', 'id'],
                    where
                }
            }, 
            {
                model: Session,
                attributes: ['active']
            }
        ] 
    });
    if (user) {
        res.json(user);
    } else {
        res.status(404).end();
    }
})

router.post('/', async (req, res) => {
    const user = await User.create(req.body);
    res.json(user);
});

module.exports = router;