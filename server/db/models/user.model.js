const { DataTypes } = require('sequelize');
const sequelize = require('../connection.config.js');
const bcrypt = require("bcrypt")


const User = sequelize.define('User', {
	// Model attributes are defined here
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		set(value){
			this.setDataValue( 'email', value.toLowerCase() )
		}
	},
	username: {
		type: DataTypes.STRING,
		allowNull: false,
		set(value){
			this.setDataValue( 'username', value.toLowerCase() )
		}
	},
	isVIP: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
		set(value){
			this.setDataValue( 'password', bcrypt.hashSync(value, 12) )
		}
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue : DataTypes.NOW
	}
}, {
	// Other model options go here
});


module.exports = User;