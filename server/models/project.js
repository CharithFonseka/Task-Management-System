module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  Project.associate = (models) => {
    Project.hasMany(models.Task, { foreignKey: 'project_id' });
    Project.belongsTo(models.User, { foreignKey: 'created_by' });
  };

  return Project;
};