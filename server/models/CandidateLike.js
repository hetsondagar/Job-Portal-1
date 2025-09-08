const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const CandidateLike = sequelize.define('CandidateLike', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
		allowNull: false
	},
	employerId: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: 'users',
			key: 'id'
		}
	},
	candidateId: {
		type: DataTypes.UUID,
		allowNull: false,
		references: {
			model: 'users',
			key: 'id'
		}
	}
}, {
	tableName: 'candidate_likes',
	timestamps: true,
	underscored: true,
	indexes: [
		{
			fields: ['employer_id', 'candidate_id'],
			unique: true,
			name: 'unique_employer_candidate_like'
		},
		{
			fields: ['candidate_id']
		}
	]
});

module.exports = CandidateLike;
