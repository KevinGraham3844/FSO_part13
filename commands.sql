CREATE TABLE blogs (
id SERIAL PRIMARY KEY,
author text,
url text NOT NULL,
title text NOT NULL,
likes integer DEFAULT 0
);
