module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
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
    project_id: {
      type: DataTypes.UUID
    },
    assigned_to: {
      type: DataTypes.UUID
    },
    created_by: {
      type: DataTypes.UUID
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      defaultValue: 'Medium'
    },
    status: {
      type: DataTypes.ENUM('To Do', 'In Progress', 'Completed'),
      defaultValue: 'To Do'
    },
    due_date: {
      type: DataTypes.DATEONLY
    }
  });

  Task.associate = (models) => {
  Task.belongsTo(models.Project, { foreignKey: 'project_id' });
  Task.belongsTo(models.User, { 
    foreignKey: 'assigned_to',
    as: 'assignee'         
  });
  Task.hasMany(models.Comment, { foreignKey: 'task_id' });
  Task.hasMany(models.Attachment, { foreignKey: 'task_id' });
};

  return Task;
};