module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define('Attachment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    task_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_name: {
      type: DataTypes.STRING
    }
  });

Attachment.associate = (models) => {
  Attachment.belongsTo(models.Task, { foreignKey: 'task_id' });
  Attachment.belongsTo(models.User, {foreignKey: 'uploaded_by', as: 'uploader'});
};

  return Attachment;
};