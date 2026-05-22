import { useState } from 'react';
import type { Priority, Status, Task } from '../../types/task';
import TaskCard from '../TaskCard/TaskCard';
import './BoardColumn.css';

type SortKey = 'manual' | 'priority' | 'deadline' | 'createdAt';

const PRIORITY_ORDER: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function sortTasks(tasks: Task[], key: SortKey): Task[] {
  const arr = [...tasks];
  switch (key) {
    case 'manual':
      return arr.sort((a, b) => {
        if (a.displayOrder === null && b.displayOrder === null) return 0;
        if (a.displayOrder === null) return 1;
        if (b.displayOrder === null) return -1;
        return a.displayOrder - b.displayOrder;
      });
    case 'priority':
      return arr.sort((a, b) => {
        const pa = a.priority !== null ? PRIORITY_ORDER[a.priority] : 99;
        const pb = b.priority !== null ? PRIORITY_ORDER[b.priority] : 99;
        return pa - pb;
      });
    case 'deadline':
      return arr.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline < b.deadline ? -1 : 1;
      });
    case 'createdAt':
      return arr.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }
}

interface Props {
  status: Status;
  label: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onUpdated: (task: Task) => void;
  onDelete: (task: Task) => void;
  onDrop: (taskId: number, newStatus: Status) => void;
  onReorder: (status: Status, orderedIds: number[]) => void;
  onDragStart?: (taskId: number) => void;
  onDragEnd?: () => void;
}

export default function BoardColumn({
  status,
  label,
  tasks,
  onEdit,
  onUpdated,
  onDelete,
  onDrop,
  onReorder,
  onDragStart,
  onDragEnd,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('manual');
  const [dragOverCardId, setDragOverCardId] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after'>('after');

  const sorted = sortTasks(tasks, sortKey);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDragOverCardId(null);
    }
  };

  const handleDragOverCard = (e: React.DragEvent, cardId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    setDragOverCardId(cardId);
    setDropPosition(pos);
  };

  const handleDragLeaveCard = () => {
    // カラムの handleDragLeave に任せる
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragOverCardId(null);

    const taskId = Number(e.dataTransfer.getData('taskId'));
    const sourceStatus = e.dataTransfer.getData('sourceStatus') as Status;
    if (!taskId) return;

    if (sourceStatus === status) {
      if (sortKey !== 'manual') return;
      const currentOrder = sorted.map((t) => t.id);
      const fromIndex = currentOrder.indexOf(taskId);
      if (fromIndex === -1) return;

      const filtered = currentOrder.filter((id) => id !== taskId);
      const targetIndex = dragOverCardId !== null ? currentOrder.indexOf(dragOverCardId) : filtered.length;
      const insertAt = dragOverCardId !== null
        ? (dropPosition === 'before' ? targetIndex : targetIndex + 1)
        : filtered.length;
      const adjustedInsert = insertAt > fromIndex ? insertAt - 1 : insertAt;
      filtered.splice(adjustedInsert, 0, taskId);
      onReorder(status, filtered);
    } else {
      onDrop(taskId, status);
    }
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
      <select
        className="column-sort-select"
        value={sortKey}
        onChange={(e) => setSortKey(e.target.value as SortKey)}
      >
        <option value="manual">手動順</option>
        <option value="priority">優先度順</option>
        <option value="deadline">期限順</option>
        <option value="createdAt">作成日順</option>
      </select>
      <div className="column-body">
        {sorted.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onUpdated={onUpdated}
            onDelete={onDelete}
            dragIndicator={dragOverCardId === task.id ? dropPosition : null}
            onDragOverCard={sortKey === 'manual' ? handleDragOverCard : undefined}
            onDragLeaveCard={handleDragLeaveCard}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
        {sorted.length === 0 && (
          <p className="column-empty">タスクはありません</p>
        )}
      </div>
    </div>
  );
}
