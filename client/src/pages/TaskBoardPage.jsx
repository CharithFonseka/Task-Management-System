import React, { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getAllTasks, updateTask, updateTaskStatus } from '../api/taskApi';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/Layout/AppLayout';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'To Do', label: 'To Do', color: '#6366f1', icon: '○' },
  { id: 'In Progress', label: 'In Progress', color: '#f59e0b', icon: '◑' },
  { id: 'Completed', label: 'Completed', color: '#10b981', icon: '●' },
];

const TaskBoardPage = () => {
  const { canManageTasks, isCollaborator, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (priorityFilter) params.priority = priorityFilter;
      const res = await getAllTasks(params);
      setTasks(res.data.data || []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [priorityFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const getColumnTasks = (status) => {
    let filtered = tasks.filter((t) => t.status === status);
    if (search) {
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered;
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    // Collaborators can only move their own tasks
    if (isCollaborator && task.assigned_to !== user.id) {
      toast.error('You can only update tasks assigned to you');
      return;
    }

    const newStatus = destination.droppableId;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      if (isCollaborator) {
        await updateTaskStatus(draggableId, newStatus);
      } else {
        await updateTask(draggableId, { ...task, status: newStatus });
      }
      toast.success('Task status updated');
    } catch {
      // Revert
      setTasks((prev) =>
        prev.map((t) => (t.id === draggableId ? { ...t, status: task.status } : t))
      );
      toast.error('Failed to update task status');
    }
  };

  const openCreate = () => { setEditTask(null); setModalOpen(true); };

  return (
    <AppLayout>
      <div className="page">
        <div className="page__header">
          <div>
            <h2 className="page__title">Task Board</h2>
            <p className="page__subtitle">Drag & drop tasks to update their status</p>
          </div>
          {canManageTasks && (
            <button id="new-task-btn" className="btn btn--primary" onClick={openCreate}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </button>
          )}
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="search-wrap">
            <svg className="search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="form-input search-input"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-input filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="kanban-board">
            {COLUMNS.map((col) => (
              <div key={col.id} className="kanban-col skeleton-col">
                <div className="skeleton" style={{ height: 36, marginBottom: 16 }} />
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, marginBottom: 12 }} />)}
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-board">
              {COLUMNS.map((col) => {
                const colTasks = getColumnTasks(col.id);
                return (
                  <div key={col.id} className="kanban-col">
                    <div className="kanban-col__header" style={{ borderColor: col.color }}>
                      <div className="kanban-col__title-wrap">
                        <span className="kanban-col__icon" style={{ color: col.color }}>{col.icon}</span>
                        <h3 className="kanban-col__title">{col.label}</h3>
                        <span className="kanban-col__count" style={{ background: `${col.color}20`, color: col.color }}>
                          {colTasks.length}
                        </span>
                      </div>
                    </div>

                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          className={`kanban-col__body ${snapshot.isDraggingOver ? 'kanban-col__body--over' : ''}`}
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {colTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <TaskCard
                                  task={task}
                                  provided={provided}
                                  snapshot={snapshot}
                                />
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {colTasks.length === 0 && !snapshot.isDraggingOver && (
                            <div className="kanban-empty">
                              <p>No tasks here</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      <TaskFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editTask}
        onSuccess={fetchTasks}
      />
    </AppLayout>
  );
};

export default TaskBoardPage;
