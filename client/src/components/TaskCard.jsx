import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isPast, parseISO } from 'date-fns';

const PRIORITY_MAP = {
  High: { label: 'High', cls: 'badge--danger' },
  Medium: { label: 'Medium', cls: 'badge--warning' },
  Low: { label: 'Low', cls: 'badge--success' },
};

const TaskCard = ({ task, provided, snapshot }) => {
  const navigate = useNavigate();
  const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.Medium;
  const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && task.status !== 'Completed';

  return (
    <div
      className={`task-card ${snapshot?.isDragging ? 'task-card--dragging' : ''}`}
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <div className="task-card__header">
        <span className={`badge ${priority.cls}`}>{priority.label}</span>
        <span className="task-card__id">#{task.id?.slice(0, 6)}</span>
      </div>

      <h3 className="task-card__title">{task.title}</h3>

      {task.description && (
        <p className="task-card__desc">{task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}</p>
      )}

      <div className="task-card__footer">
        {task.due_date && (
          <span className={`task-card__due ${isOverdue ? 'task-card__due--overdue' : ''}`}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {format(parseISO(task.due_date), 'MMM d')}
          </span>
        )}

        {task.assignee && (
          <div className="task-card__assignee" title={task.assignee.name}>
            <div className="task-card__avatar">
              {task.assignee.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
