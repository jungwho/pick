//서버 측 파일
var express = require('express');
var mysql = require('mysql');
var https = require('https');
var fs = require('fs');
var path = require('path');
var session = require('express-session');
var app = express();
var dbConfig = require(__dirname + '/config/db.js');
var conn = dbConfig.init();

dbConfig.connect(conn);

app.get('/', function (req, res) {
    res.send('mainTEST');
});


const filePath = path.join(__dirname, 'views', 'html', 'recommend');


app.set('view engine', 'ejs');
app.set('views', filePath);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(filePath, { root: __dirname }));
app.use(express.static("views"));
app.use(express.static("views/html"));
app.use(express.static("views/javascript"));
app.use(express.static(__dirname + '/express-mysql-0524'));


app.use(
    session({
        secret: 'your-secret-key',
        //임의로 설정 가능
        resave: false,
        saveUninitialized: true,
    })
);

app.post('/home', (req, res) => {
    const username = req.body.username;
    req.session.username = username;

    res.json({ result: 'success' });
});

app.post('/gender', (req, res) => {
    const gender = req.body.gender; //gender
    req.session.gender = gender;

    res.json({ result: 'success' });
});

app.post('/season', (req, res) => {
    const season = req.body.season; //season
    req.session.season = season;

    res.json({ result: 'success' });
});

app.post('/style', (req, res) => {
    const style = req.body.style;
    req.session.style = style;

    res.json({ result: 'success' });
});

app.post('/price', (req, res) => {
    const price = req.body.price; //price
    req.session.price = price;

    res.json({ result: 'success' });
});

app.post('/color', (req, res) => {
    const color_top = req.body.color_top; //color_top
    // const color_bottom = req.body.give_test_input_6; //color_bottom
    req.session.color_top = color_top;
    // req.session.color_bottom = color_bottom;

    res.json({ result: 'success' });
});

// app.post('/fit', (req, res) => {
//     const fit = req.body.fit; //gender
//     req.session.fit = fit;

//     res.json({ result: 'success' });
// });

app.post('/fit', (req, res) => {
    const username = req.session.username;
    const gender = req.session.gender; // 세션에서 gender 가져오기
    const season = req.session.season; // 세션에서 season 가져오기
    const style = req.session.style; // 세션에서 style 가져오기
    const price = req.session.price;
    const color_top = req.session.color_top;
    const fit = req.body.fit;

    const sql = 'INSERT INTO user_DB (username, gender, season, style, price, color_top, fit) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [username, gender, season, style, price, color_top, fit];
    conn.query(sql, values, (error, results) => {
        if (error) {
            console.error('Database Error:', error);
            res.status(500).json({ result: 'error' });
        } else {
            console.log('Data inserted successfully');
            res.json({ result: 'success' });
        }
    });
});




app.get('/list', function (req, res) {
    var sql = 'SELECT * FROM user_DB';
    conn.query(sql, function (err, rows, fields) {
        if (err) console.log('query is not excuted. select fail…\n' + err);
        else res.render('index.ejs', { list: rows });
    });
});

app.get('/test', function (req, res) {
    fs.readFile(__dirname + 'kiosk_test.ejs', function (error, data) {
        res.render('kiosk_test.ejs');
    });
});

app.get('/start', function (req, res) {
    fs.readFile(__dirname + 'kiosk_start.ejs', function (error, data) {
        res.render('kiosk_start.ejs');
    });
});

app.get('/intro', function (req, res) {
    fs.readFile(__dirname + 'kiosk_intro.ejs', function (error, data) {
        res.render('kiosk_intro.ejs');
    });
});

app.get('/home', function (req, res) {
    fs.readFile(__dirname + 'kiosk_home.ejs', function (error, data) {
        res.render('kiosk_home.ejs');
    });
});

app.get('/scan', function (req, res) {
    fs.readFile(__dirname + 'kiosk_scan.ejs', function (error, data) {
        res.render('kiosk_scan.ejs');
    });
});

app.get('/gender', function (req, res) {
    // fs.readFile(__dirname + 'kiosk_gender.ejs', function (error, data) {
    //     res.render('kiosk_gender.ejs');
    // });
    res.render('kiosk_gender.ejs');
});

app.get('/season', function (req, res) {
    fs.readFile(__dirname + 'kiosk_season.ejs', function (error, data) {
        res.render('kiosk_season.ejs');
    });
});

app.get('/style', function (req, res) {
    fs.readFile(__dirname + 'kiosk_style.ejs', function (error, data) {
        res.render('kiosk_style.ejs');
    });
});

app.get('/price', function (req, res) {
    fs.readFile(__dirname + 'kiosk_price.ejs', function (error, data) {
        res.render('kiosk_price.ejs');
    });
});

app.get('/color', function (req, res) {
    fs.readFile(__dirname + 'kiosk_color.ejs', function (error, data) {
        res.render('kiosk_color.ejs');
    });
});

app.get('/fit', function (req, res) {
    fs.readFile(__dirname + 'kiosk_fit.ejs', function (error, data) {
        res.render('kiosk_fit.ejs');
    });
});

app.get('/result', function (req, res) {
    fs.readFile(__dirname + 'kiosk_result.ejs', function (error, data) {
        res.render('kiosk_result.ejs');
    });
});

// SSL options
var options = {
    key: fs.readFileSync('./config/key.pem'),
    cert: fs.readFileSync('./config/cert.pem')
};

// Create HTTPS server
// https.createServer(options, app).listen(3000, () => console.log('HTTPS server listening on port 3000'));

https.createServer(options, app).listen(8000, () => {
    console.log('서버가 8000 포트에서 실행 중입니다.');
});

process.on('SIGINT', () => {
    conn.end();
    console.log('MySQL 연결이 종료되었습니다.');
    process.exit();
});

