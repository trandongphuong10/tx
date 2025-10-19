require('dotenv').config();
var cors = require('cors');
let Telegram      = require('node-telegram-bot-api');
let TelegramToken = '8108043503:AAEA3Y-76ULzfJ9HQj4hqhTfh86d9G5BD4c';

// 🔥 SỬA ĐOẠN NÀY - KHÔNG ẢNH HƯỞNG MODEL KHÁC
let TelegramBot = null;

// Khởi tạo bot sau khi server đã chạy ổn định
setTimeout(() => {
    initializeTelegramBot();
}, 20000); // Chờ 20 giây để các model khác load xong

function initializeTelegramBot() {
    try {
        TelegramBot = new Telegram(TelegramToken, {
            polling: true,
            request: {
                timeout: 30000,
                agentOptions: {
                    keepAlive: true,
                    family: 4
                }
            }
        });
        
        console.log('✅ Telegram Bot started successfully');
        if (redT) {
            redT.telegram = TelegramBot;
        }
        
    } catch (error) {
        console.log('⚠️ Telegram Bot disabled due to conflict');
        console.log('ℹ️ This does not affect other games functionality');
    }
}

let fs 			  = require('fs');
let express       = require('express');
let app           = express();
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}));
let port       = process.env.PORT || 80;
let expressWs  = require('express-ws')(app);
let bodyParser = require('body-parser');
var morgan = require('morgan');

// Setting & Connect to the Database
let configDB = require('./config/database');
let mongoose = require('mongoose');
require('mongoose-long')(mongoose);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex',   true);
mongoose.connect(configDB.url, configDB.options);

// cấu hình tài khoản admin mặc định và các dữ liệu mặc định
require('./config/admin');

// đọc dữ liệu from
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(morgan('combined'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

// 🔥 THÊM STATIC ROUTES
app.use('/playgame', express.static('playgame'));
app.use('/assets', express.static('assets'));
app.use('/src', express.static('src'));

// server socket
let redT = expressWs.getWss();
process.redT = redT;

global['redT'] = redT;
global['userOnline'] = 0;

// 🔥 THÊM TRY-CATCH để bảo vệ các model khác
try {
    require('./app/Helpers/socketUser')(redT);
    require('./routerHttp')(app, redT);
    require('./routerCMS')(app, redT);
    require('./routerSocket')(app, redT);
    require('./app/Cron/taixiu')(redT);
    require('./app/Cron/baucua')(redT);
    require('./config/cron')();
    
    // Telegram Bot sẽ được require sau nếu cần
    setTimeout(() => {
        if (TelegramBot) {
            require('./app/Telegram/Telegram')(redT);
        }
    }, 25000);
    
} catch (error) {
    console.log('⚠️ Some modules failed to load, but server continues...');
    console.log('Error:', error.message);
}

// 🔥 THÊM TEMPORARY HOME PAGE
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>GO88 Game Server</title>
            <style>
                body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #4CAF50; margin-bottom: 20px; }
                .status { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .btn { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
                .btn:hover { background: #45a049; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎮 GO88 Game Server</h1>
                <div class="status">
                    <p><strong>Status:</strong> 🟢 Online & Running</p>
                    <p><strong>URL:</strong> https://go88-k37y.onrender.com</p>
                    <p><strong>Telegram Bot:</strong> ✅ Active</p>
                </div>
                <p>
                    <a href="/playgame/" class="btn">🎮 Play Game</a>
                    <a href="/health" class="btn">🔍 Health Check</a>
                </p>
                <p><small>Server started successfully! Game systems are running.</small></p>
            </div>
        </body>
        </html>
    `);
});

// 🔥 THÊM Health check route cho Render.com
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'TX Server',
        games: ['Tài Xỉu', 'Bầu Cua'],
        telegram_bot: TelegramBot ? 'Active' : 'Disabled'
    });
});

// 🔥 QUAN TRỌNG: Bind to 0.0.0.0 cho Render.com
const host = process.env.RENDER ? '0.0.0.0' : 'localhost';
app.listen(port, host, function() {
    console.log(`✅ Server started on http://${host}:${port}`);
    console.log(`✅ Render.com compatible: ${process.env.RENDER ? 'YES' : 'NO'}`);
});