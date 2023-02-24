const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const nunjucks = require('nunjucks');

const { sequelize } = require('./models');

dotenv.config();
const pageRouter = require('./routes/page');

const app = express();
app.set('port', process.env.PORT);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});

sequelize.sync({ force: false })
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    });

app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', pageRouter);
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '/views/main.html'));
// })

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '포트에서 대기 중');
});