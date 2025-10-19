require('dotenv').config();
var cors = require('cors');
let Telegram      = require('node-telegram-bot-api');
<<<<<<< HEAD
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
        redT.telegram = TelegramBot;
        
    } catch (error) {
        console.log('⚠️ Telegram Bot disabled due to conflict');
        console.log('ℹ️ This does not affect other games functionality');
    }
}

=======
let TelegramToken = '7841015878:AAFvN2EdJsgNr8bu0ujb2M_4I7Q9Q2ygbq4';
let TelegramBot   = new Telegram(TelegramToken, {polling: true});
>>>>>>> c9316a815d6a98f818c51ca1824879bd79573f4b
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

// server socket
let redT = expressWs.getWss();
process.redT = redT;
// 🔥 TẠM THỜI KHÔNG GÁN TelegramBot vào đây - sẽ gán sau khi khởi tạo
// redT.telegram = TelegramBot; // ĐÃ CHUYỂN LÊN TRÊN

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

app.listen(port, function() {
    console.log("Server listen on port ", port);
});
