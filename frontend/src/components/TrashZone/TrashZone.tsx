import { useState } from 'react';
import './TrashZone.css';

interface Props {
  onDrop: (taskId: number) => void;
}

export default function TrashZone({ onDrop }: Props) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = Number(e.dataTransfer.getData('taskId'));
    if (taskId) onDrop(taskId);
  };

  return (
    <div
      className={`trash-zone${isOver ? ' trash-zone--over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className="trash-zone-icon">🗑</span>
      <span className="trash-zone-label">{isOver ? 'ここで削除' : 'ゴミ箱にドロップ'}</span>
    </div>
  );
}
