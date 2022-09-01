const { DataTypes } = require('sequelize');
const sequelize = require('../connection.config.js');


const ResetPassToken = sequelize.define('ResetPassToken', {
	// Model attributes are defined here
	token: {
		type: DataTypes.STRING,
		allowNull: false
	},
	user: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	used: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue : DataTypes.NOW
	}
}, {
	// Other model options go here
});


module.exports = ResetPassToken;