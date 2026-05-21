import { useEffect, useState } from 'react';
import type { Status, Task } from '../../types/task';
import { fetchTasks, updateTaskStatus } from '../../api/taskApi';
import BoardColumn from '../BoardColumn/BoardColumn';
import TaskForm from '../TaskForm/TaskForm';
import './Board.css';

const COLUMNS: { status: Status; label: string }[] = [
  { status: 'TODO', label: '未着手' },
  { status: 'IN_PROGRESS', label: '進行中' },
  { status: 'DONE', label: '完了' },
];

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch(() => setError('タスクの取得に失敗しました'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="board-message">読み込み中...</p>;
  if (error) return <p className="board-message board-error">{error}</p>;

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(normalized) ||
          (t.description ?? '').toLowerCase().includes(normalized)
      )
    : tasks;

  const replaceTask = (updated: Task) =>
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

  const handleSaved = (task: Task) => {
    setTasks((prev) =>
      prev.some((t) => t.id === task.id)
        ? prev.map((t) => (t.id === task.id ? task : t))
        : [...prev, task]
    );
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleDrop = async (taskId: number, newStatus: Status) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;
    try {
      const updated = await updateTaskStatus(taskId, newStatus);
      replaceTask(updated);
    } catch {
      // ドロップ失敗時は何もしない
    }
  };

  return (
    <>
      {(showForm || editingTask !== undefined) && (
        <TaskForm
          initialTask={editingTask}
          onSaved={handleSaved}
          onClose={() => { setShowForm(false); setEditingTask(undefined); }}
        />
      )}
      <div className="board-toolbar">
        <input
          className="search-input"
          type="search"
          placeholder="タイトル・説明で検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="new-task-btn" onClick={() => setShowForm(true)}>
          + 新規タスク
        </button>
      </div>
      <div className="board">
        {COLUMNS.map((col) => (
          <BoardColumn
            key={col.status}
            status={col.status}
            label={col.label}
            tasks={filtered.filter((t) => t.status === col.status)}
            onEdit={setEditingTask}
            onUpdated={replaceTask}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </>
  );
}
