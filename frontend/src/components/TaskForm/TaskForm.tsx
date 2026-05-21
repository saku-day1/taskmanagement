import { useState } from 'react';
import type { CreateTaskRequest, UpdateTaskRequest, Priority, Task } from '../../types/task';
import { createTask, updateTask } from '../../api/taskApi';
import './TaskForm.css';

interface Props {
  initialTask?: Task;
  onSaved: (task: Task) => void;
  onClose: () => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'HIGH', label: '高' },
  { value: 'MEDIUM', label: '中' },
  { value: 'LOW', label: '低' },
];

export default function TaskForm({ initialTask, onSaved, onClose }: Props) {
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [description, setDescription] = useState(initialTask?.description ?? '');
  const [deadline, setDeadline] = useState(initialTask?.deadline ?? '');
  const [priority, setPriority] = useState<Priority | ''>(initialTask?.priority ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = initialTask !== undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      let saved: Task;
      if (isEdit) {
        const data: UpdateTaskRequest = {
          title: title.trim(),
          description: description.trim() || null,
          deadline: deadline || null,
          priority: priority || null,
        };
        saved = await updateTask(initialTask.id, data);
      } else {
        const data: CreateTaskRequest = {
          title: title.trim(),
          description: description.trim() || null,
          deadline: deadline || null,
          priority: priority || null,
        };
        saved = await createTask(data);
      }
      onSaved(saved);
    } catch {
      setError(isEdit ? 'タスクの更新に失敗しました' : 'タスクの登録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="task-form-overlay" onClick={onClose}>
      <div className="task-form-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="task-form-title">{isEdit ? 'タスクを編集' : '新規タスク'}</h2>
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
              {submitting ? (isEdit ? '更新中...' : '登録中...') : (isEdit ? '更新' : '登録')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
