const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.static('./'));
app.use(morgan('dev'));
app.use(bodyParser.json())

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}.`)
});

module.exports = app;