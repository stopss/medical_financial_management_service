const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = (req, res, next) => {
    const  authorization  = req.headers.cookie;
    console.log(authorization);
    const [tokenType, tokenValue] = authorization.split('=');

    if (!tokenValue) {
        res.send({
            success: false,
            msg: '로그인 후 사용하세요',
        });
        return;
    }

    try {
        const { id } = jwt.verify(tokenValue, process.env.JWT_SECRET);

        User.findByPk(id).then((user) => {

            res.locals.user = user;

            next();
        });
    } catch (error) {
        res.send({
            success: false,
            msg: '로그인 후 사용하세요',
            
        });
        return;
    }
};
