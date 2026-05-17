import { useState } from 'react';
import type { CreateTaskRequest, Priority } from '../../types/task';
import { createTask } from '../../api/taskApi';
import type { Task } from '../../types/task';
import './TaskForm.css';

interface Props {
  onCreated: (task: Task) => void;
  onClose: () => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'HIGH', label: '高' },
  { value: 'MEDIUM', label: '中' },
  { value: 'LOW', label: '低' },
];

export default function TaskForm({ onCreated, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const data: CreateTaskRequest = {
      title: title.trim(),
      description: description.trim() || null,
      deadline: deadline || null,
      priority: priority || null,
    };

    setSubmitting(true);
    setError(null);
    try {
      const created = await createTask(data);
      onCreated(created);
    } catch {
      setError('タスクの登録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="task-form-overlay" onClick={onClose}>
      <div className="task-form-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="task-form-title">新規タスク</h2>
        <form onSubmit={handleSubmit} className="task-form">
          <label className="task-form-label">
            タイトル <span className="task-form-required">*</span>
            <input
              className="task-form-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              required
              autoFocus
            />
          </label>

          <label className="task-form-label">
            説明
            <textarea
              className="task-form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </label>

          <label className="task-form-label">
            期限
            <input
              className="task-form-input"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </label>

          <label className="task-form-label">
            優先度
            <select
              className="task-form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority | '')}
            >
              <option value="">未設定</option>
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="task-form-error">{error}</p>}

          <div className="task-form-actions">
            <button type="button" className="task-form-btn-cancel" onClick={onClose}>
              キャンセル
            </button>
            <button
              type="submit"
              className="task-form-btn-submit"
              disabled={submitting || !title.trim()}
            >
              {submitting ? '登録中...' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
