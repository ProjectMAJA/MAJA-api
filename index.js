require('dotenv').config();

const cors = require('cors');
const express = require('express');
const router = require('./app/router');

const port = process.env.PORT || 5500;

const app = express();

app.use(cors());   
app.use(express.json());

app.use('/v1', router);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "mon-domaine.fr"),
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"),
    next()
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});