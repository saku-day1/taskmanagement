import { useState } from 'react';
import type { Status, Task } from '../../types/task';
import TaskCard from '../TaskCard/TaskCard';
import './BoardColumn.css';

interface Props {
  status: Status;
  label: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onUpdated: (task: Task) => void;
  onDrop: (taskId: number, newStatus: Status) => void;
}

export default function BoardColumn({ status, label, tasks, onEdit, onUpdated, onDrop }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = Number(e.dataTransfer.getData('taskId'));
    if (taskId) onDrop(taskId, status);
  };

  return (
    <div
      className={`column${isDragOver ? ' drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <span className="column-label">{label}</span>
        <span className="column-count">{tasks.length}</span>
      </div>
      <div className="column-body">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onUpdated={onUpdated} />
        ))}
        {tasks.length === 0 && (
          <p className="column-empty">タスクはありません</p>
        )}
      </div>
    </div>
  );
}
