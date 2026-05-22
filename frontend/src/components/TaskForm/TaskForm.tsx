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
  const [priority, setPriority] = useState<Priority>(initialTask?.priority ?? 'MEDIUM');
  const [titleTouched, setTitleTouched] = useState(false);
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
          priority,
        };
        saved = await updateTask(initialTask.id, data);
      } else {
        const data: CreateTaskRequest = {
          title: title.trim(),
          description: description.trim() || null,
          deadline: deadline || null,
          priority,
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
              className={`task-form-input${titleTouched && !title.trim() ? ' task-form-input--error' : ''}`}
              type="text"
              value={title}
              placeholder="タスクのタイトルを入力"
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleTouched(true)}
              maxLength={50}
              autoFocus
            />
            {titleTouched && !title.trim() && (
              <span className="task-form-field-error">タイトルを入力してください</span>
            )}
          </label>

          <label className="task-form-label">
            説明
            <textarea
              className="task-form-textarea"
              value={description}
              placeholder="説明文を入力（任意）"
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
            優先度 <span className="task-form-required">*</span>
            <select
              className="task-form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
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
              onClick={() => setTitleTouched(true)}
            >
              {submitting ? (isEdit ? '更新中...' : '登録中...') : (isEdit ? '更新' : '登録')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
