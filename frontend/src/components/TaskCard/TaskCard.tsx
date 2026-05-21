import type { Status, Task } from '../../types/task';
import { updateTaskStatus } from '../../api/taskApi';
import './TaskCard.css';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onUpdated: (task: Task) => void;
  dragIndicator?: 'before' | 'after' | null;
  onDragOverCard?: (e: React.DragEvent, cardId: number) => void;
  onDragLeaveCard?: () => void;
}

const PRIORITY_LABEL: Record<string, string> = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
};

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'TODO', label: '未着手' },
  { value: 'IN_PROGRESS', label: '進行中' },
  { value: 'DONE', label: '完了' },
];

export default function TaskCard({
  task,
  onEdit,
  onUpdated,
  dragIndicator,
  onDragOverCard,
  onDragLeaveCard,
}: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = task.deadline !== null && new Date(task.deadline) < today;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', String(task.id));
    e.dataTransfer.setData('sourceStatus', task.status);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Status;
    try {
      const updated = await updateTaskStatus(task.id, newStatus);
      onUpdated(updated);
    } catch {
      // 失敗時はUIを変えない
    }
  };

  const cardClass = [
    'card',
    dragIndicator === 'before' ? 'drag-indicator-before' : '',
    dragIndicator === 'after' ? 'drag-indicator-after' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClass}
      draggable
      onDragStart={handleDragStart}
      onDragOver={onDragOverCard ? (e) => onDragOverCard(e, task.id) : undefined}
      onDragLeave={onDragLeaveCard}
    >
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
      <select
        className="card-status-select"
        value={task.status}
        onChange={handleStatusChange}
        onClick={(e) => e.stopPropagation()}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
