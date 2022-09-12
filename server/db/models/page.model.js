const { DataTypes } = require('sequelize');
const sequelize = require('../connection.config.js');

const Page = sequelize.define('Page', {
	// Model attributes are defined here
	name: {
		type: DataTypes.STRING,
		allowNull: false,
        defaultValue: 'New Page'
	},
	title: {
		type: DataTypes.STRING,
		allowNull: true,
        defaultValue: 'New Page'
	},
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
		// index, template or other error pages
        type: DataTypes.STRING,
        allowNull: true,
    },
    headerScripts: {
        type: DataTypes.STRING,
		allowNull: true,
		defaultValue: ''
    },
	creatorID: {
        // Define this as foriegn key below
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	projectID: {
        // Define this as foriegn key below
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	content: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	/* createdAt: {
		type: DataTypes.DATE,
		defaultValue : DataTypes.NOW
	} */
});

module.exports = Page;