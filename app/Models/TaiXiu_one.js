let mongoose = require('mongoose');

let Schema = new mongoose.Schema({
	uid:      {type: String,  required: true, index: true}, // ID Người cược 
	phien:    {type: Number,  required: true, default: 0, index: true}, // phiên cược - ĐÃ THÊM default: 0
	bet:      {type: Number,  required: true},    // số tiền cược
	select:   {type: Boolean, required: true},    // bên cược  (Tài = true, Xỉu = false)
	tralai:   {type: Number,  default: 0},        // Số tiền trả lại
	thuong:   {type: Number,  default: 0},        // Thưởng Red khi chơi bằng xu
	win:      {type: Boolean, default: false},	  // Thắng hoặc thua
	betwin:   {type: Number,  default: 0},	      // Tiền thắng được
});

// 👉 Tự động x2 tiền khi thắng
Schema.pre('save', function(next) {
	if (this.win === true) {
		this.betwin = this.bet * 2;
	}
	next();
});

Schema.index({uid:1, phien:1}, {background: true});

module.exports = mongoose.model('TaiXiu_one', Schema);