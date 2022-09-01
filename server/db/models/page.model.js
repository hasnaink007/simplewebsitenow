const { DataTypes } = require('sequelize');
const sequelize = require('../connection.config.js');

const Page = sequelize.define('Page', {
	// Model attributes are defined here
	name: {
		type: DataTypes.STRING,
		allowNull: false,
        defaultValue: 'New Page'
	},
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isTemplate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    headerScripts: {
        type: DataTypes.STRING,
		allowNull: true
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