const { DataTypes } = require('sequelize');
const sequelize = require('../connection.js');

const Note = sequelize.define('Note', {
	// Model attributes are defined here
	title: {
		type: DataTypes.STRING,
		allowNull: false
	},
	content: {
		type: 'TEXT (16383)',
	},
	owner: {
		type: 'INT',
		allowNull: false,
	},
	deleted: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	shareLink: {
		type: DataTypes.STRING,
		allowNull: true
	},
	sharedAccessType: {
		type: DataTypes.STRING,
		allowNull: true,
		// possible options view, edit and none
		defaultValue: 'none'
	},
	parent: {
		type: 'INT',
		allowNull: true,
		defaultValue: 0
	},
	createdAt: {
		type: DataTypes.DATE,
		defaultValue : DataTypes.NOW
	}
}, {
	// Other model options go here
});


module.exports = Note;