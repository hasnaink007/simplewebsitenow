const { DataTypes } = require('sequelize');
const sequelize = require('../connection.js');


const Coupon = sequelize.define('Coupon', {
	code: {
		type: DataTypes.STRING,
		allowNull: false
	},
	userEmail: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	usedDate: {
		type: DataTypes.DATE,
		allowNull: true,
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue : DataTypes.NOW
	}
}, {
	// Other model options go here
});


module.exports = Coupon;