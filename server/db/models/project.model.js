const { DataTypes } = require('sequelize');
const sequelize = require('../connection.config.js');

const Project = sequelize.define('Project', {
	// Model attributes are defined here
	
	name: {
		type: DataTypes.STRING,
		allowNull: false,
        defaultValue: 'New Project'
	},
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
	ownerID: {
        // Define this as foriegn key below
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	domainName: {
		type: DataTypes.STRING,
        allowNull: true,
	},
	filesPath: {
		type: DataTypes.STRING,
        allowNull: false,
	},
	nginxFilePath: {
		type: DataTypes.STRING,
        allowNull: true,
	},
	isSubDomain: {
		type: DataTypes.BOOLEAN,
		defaultValue: true,
		allowNull: true,
	}
});

module.exports = Project;