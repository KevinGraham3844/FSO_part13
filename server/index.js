const express = require('express');
const app = express();
require('express-async-errors');
const middleware = require('./util/middleware');


const { PORT } = require('./util/config');
const { connectToDatabase } = require('./util/db');

const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const authorsRouter = require('./controllers/authors');
const readingsRouter = require('./controllers/readinglists');
const logoutRouter = require('./controllers/logout');

app.use(express.json());

app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/readinglists', readingsRouter);
app.use('/api/logout', logoutRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);


const start = async () => {
    await connectToDatabase();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start();

