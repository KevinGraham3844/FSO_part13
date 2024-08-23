const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { SECRET } = require('../util/config');
const { tokenExtractor } = require('../util/middleware');
const { Op } = require('sequelize');

const { Blog, User, Session } = require('../models');

const blogFinder = async (req, _res, next) => {
    req.blog = await Blog.findByPk(req.params.id);
    next();
}

router.get('/', async (req, res) => {
    let where = {}

    if (req.query.search) {
        where = {
            [Op.or]: [
                {
                    title: {
                        [Op.substring]: req.query.search
                    }
                },
                {
                    author: {
                        [Op.substring]: req.query.search
                    }
                }
            ]
        }
    }

    const blogs = await Blog.findAll({
        attributes: { exclude: ['userId'] },
        order: [
            ['likes', 'DESC']
        ],
        include: {
            model: User,
            attributes: ['name']
        },
        where
    });
    console.log(JSON.stringify(blogs, null, 2));
    res.json(blogs)
});

router.get('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
        console.log(req.blog.toJSON());
        res.json(req.blog);
    } else {
        res.status(404).end();
    }
});

router.put('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
        console.log(req.blog);
        req.blog.likes = req.body.likes;
        console.log(req.blog.likes);
        await req.blog.save();
        res.json(req.blog)
    } else {
        res.status(404).end();
    }
});

router.delete('/:id', blogFinder, tokenExtractor, async (req, res) => {
    const token = req.get('authorization').substring(7);
    
    const user = await User.findOne({
        where: {
            username: req.decodedToken.username
        },
        include: [
            {
                model: Blog
            },
            {
                model: Session,
                attributes: ['active', 'token']
            }
        ] 
    });

    const foundBlog = user.blogs.filter(blog => blog.dataValues.id === Number(req.params.id));

    if(!user.session) {
        return res.send('user does not have an active session or is using an expired token').end()
     } else if (user.disabled) {
        return res.send('users actions have been disabled').end()
     } else if (user.session.token !== token) {
        return res.send('user token is expired').end()
     } else if (foundBlog.length === 1) {
        res.send('blog successfully destroyed')
        await req.blog.destroy();
    } else {
        res.send('User is not allowed to delete this blog');
    }
    res.status(204).end();
});


router.post('/', tokenExtractor, async (req, res) => {
    const token = req.get('authorization').substring(7);
    const user = await User.findByPk(req.decodedToken.id, {
        include: {
            model: Session,
            attributes: ['active', 'token']
        }
    });
 
    if(!user.session) {
        res.send('user does not have an active session').end()
    } else if (user.disabled) {
        res.send('users actions have been disabled').end()
    } else if (user.session.token !== token) {
        res.send('user token is expired')
    } else {
        const blog = await Blog.create({ ...req.body, author: user.name, userId: user.id, date: new Date() });
        res.json(blog);
    }
});


module.exports = router
