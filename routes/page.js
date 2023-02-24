const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const authMiddleware = require('../middlewares/auth-middleware');
const { User, Board, Management } = require('../models');

const router = express.Router();

try {
    fs.readdirSync('uploads');
} catch(error) {
    console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
});

router.post('/upload', upload.single('file'), (req, res) => {
    console.log(req.file, req.body);
    res.send('ok');
})


router.get('/', (req, res, next) => {
    res.render('main', {
        title: '의료 재무관리 서비스',
    });
});

router.post('/login', async(req, res) => {
    console.log("로그인 api");
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email, password }});

    if(!user) {
        res.send({
            success: false,
            msg: '이메일 또는 패스워드가 잘못됐습니다.',
        });
        return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    console.log("token", token);
    res.cookie('user-token', token);
    res.send({
        success: true,
        token,
    });
}) 

router.get('/register', async(req, res) => {
    res.render('register', {})
})
router.post('/register', async(req, res) => {
    console.log('회원 가입 api');
    const { email, nickname, password, passwordchk }  = req.body;
    const type = true;

    // 비밀번호랑 비밀번호 확인이 일치하는지
    if (password != passwordchk) {
        res.send({
            success: false,
            msg: '비밀번호가 비밀번호 확인과 동일하지 않습니다.'
        });
        return;
    }

    // 닉네임, 이메일 중복 확인
    const existUsers = await User.findAll({
        where: {
            [Op.or]: [{ nickname }, { email }],
        },
    });
    if (existUsers.length) {
        res.send({
            success: false,
            msg: '이미 가입된 이메일 또는 닉네임이 있습니다.'
        });
        return;
    }

    await User.create({ email, nickname, password, type });

    res.send({
        success: true
    })
})

router.get('/board', authMiddleware, async(req, res, next) => {

    console.log('게시판');

    const { id } = res.locals.user;
    
    const board_list = await Board.findAll({
        where: { userId: id },
        order:[['updatedAt', 'DESC']]
    });

    const management_list = await Management.findAll({
        where: { userId: id },
        order:[['updatedAt', 'DESC']]
    });

    res.render('board', {
        board_list,
        management_list
    });
});

router.post('/board', authMiddleware, upload.single("file"), async(req, res) => {
    console.log("게시판 작성 api");
    
    const { id } = res.locals.user;
    const existsUser = await User.findOne({
        where: {
            id,
        }
    });
    
    const { title } = req.body;

    await Board.create({ title, write: existsUser.nickname, file: req.file.filename, userId: id})
    res.redirect('/board');
})


router.get('/management', authMiddleware, async(req, res, next) => {

    console.log('재무정리 목록 api');

    res.render('management', {
    });
});

router.get('/admin', authMiddleware, async(req, res, next) => {
    console.log('관리자 API');

    const { id } = res.locals.user;
    
    const existUser = await User.findOne({
        where: { id }
    });
    if(existUser.type) {
        const error = new HttpError("접근 권한이 없습니다.", 500);

        next(error);
    };

    const board_list = await Board.findAll({
        order:[['updatedAt', 'DESC']]
    });

    const management_list = await Management.findAll({
        order:[['updatedAt', 'DESC']]
    });

    res.render('admin', {
        board_list,
        management_list,
    });
});

router.post('/admin', authMiddleware, upload.single("file"), async(req, res) => {
    console.log("관리자 작성 api");
    
    const { id } = res.locals.user;
    const existsUser = await User.findOne({
        where: {
            id,
        }
    });
    
    const { title, user } = req.body;

    const userId = await User.findOne({
        where: { nickname: user }
    });

    await Management.create({ title, write: existsUser.nickname, file: req.file.filename, userId: userId.id, user})
    res.redirect('/admin');
})

router.get('/:fileName', async(req, res) => {
    console.log("파일 다운로드 api");
    const fileName = req.params.fileName;
    console.log(fileName);

    let isFileExist;

    try {
        // fs.existsSync()를 사용하여 파일 존재 여부를 검증한다. Boolean 타입의 값을 반환한다.
        isFileExist = fs.existsSync(`uploads/${fileName}`);
    } catch (err) {
        const error = new HttpError(
            "File searching is failed...Please try again.",500
        );

        next(error);
    }

    // 파일이 존재하지 않는다면 에러 처리
    if (!isFileExist) {
        // const error = new HttpError("There is no file. Please try again.", 500);

        // next(error);
    }

    try {
        // download()를 사용해서 파일을 프론트쪽으로 보내준다.
        res.download(`uploads/${fileName}`);
    } catch (err) {
        // const error = new HttpError("File download is faild. Please try again.",500);

        // next(error);
    }
})




module.exports = router;