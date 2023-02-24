const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const nunjucks = require('nunjucks');

dotenv.config();

const app = express();
app.set('port', process.env.PORT);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});

app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '포트에서 대기 중');
});