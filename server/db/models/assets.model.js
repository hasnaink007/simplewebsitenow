const { DataTypes } = require('sequelize');
const sequelize = require('../connection.config.js');

const Assets = sequelize.define('Assets', {
	// Model attributes are defined here
	src: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	projectID: {
		type: DataTypes.INTEGER,
		allowNull: false,
	}
});

module.exports = Assets;