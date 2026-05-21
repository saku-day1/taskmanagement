import type { Task } from '../../types/task';
import './TaskCard.css';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
}

const PRIORITY_LABEL: Record<string, string> = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
};

export default function TaskCard({ task, onEdit }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue =
    task.deadline !== null && new Date(task.deadline) < today;

  return (
    <div className="card">
      <div className="card-header">
        {task.priority && (
          <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
            {PRIORITY_LABEL[task.priority]}
          </span>
        )}
        <button className="card-edit-btn" onClick={() => onEdit(task)} aria-label="編集">
          ✎
        </button>
      </div>
      <p className="card-title">{task.title}</p>
      {task.description && (
        <p className="card-description">{task.description}</p>
      )}
      {task.deadline && (
        <p className={`card-deadline${isOverdue ? ' overdue' : ''}`}>
          期限: {task.deadline}
          {isOverdue && <span className="overdue-badge">期限切れ</span>}
        </p>
      )}
    </div>
  );
}
