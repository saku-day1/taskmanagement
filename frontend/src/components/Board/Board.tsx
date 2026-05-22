import { useEffect, useState } from 'react';
import type { Status, Task } from '../../types/task';
import { fetchTasks, updateTaskStatus, reorderTasks, deleteTask } from '../../api/taskApi';
import BoardColumn from '../BoardColumn/BoardColumn';
import TaskForm from '../TaskForm/TaskForm';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import TrashZone from '../TrashZone/TrashZone';
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
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
        : [task, ...prev]
    );
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleReorder = async (status: Status, orderedIds: number[]) => {
    setTasks((prev) => {
      const inColumn = orderedIds.map((id) => prev.find((t) => t.id === id)!).filter(Boolean);
      const others = prev.filter((t) => t.status !== status || !orderedIds.includes(t.id));
      return [...others, ...inColumn];
    });
    try {
      const updated = await reorderTasks(status, orderedIds);
      setTasks((prev) => {
        const updatedMap = new Map(updated.map((t) => [t.id, t]));
        return prev.map((t) => updatedMap.get(t.id) ?? t);
      });
    } catch {
      fetchTasks().then(setTasks).catch(() => {});
    }
  };

  const handleDeleteRequest = (task: Task) => {
    setDeletingTask(task);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    const target = deletingTask;
    setDeletingTask(null);
    try {
      await deleteTask(target.id);
      setTasks((prev) => prev.filter((t) => t.id !== target.id));
    } catch {
      // 削除失敗時はUIを変えない
    }
  };

  const handleTrashDrop = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) setDeletingTask(task);
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
      {deletingTask && (
        <ConfirmDialog
          title="タスクを削除しますか？"
          message={`「${deletingTask.title}」を削除します。この操作は取り消せません。`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingTask(null)}
        />
      )}
      {isDragging && <TrashZone onDrop={handleTrashDrop} />}
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
            onDelete={handleDeleteRequest}
            onDrop={handleDrop}
            onReorder={handleReorder}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          />
        ))}
      </div>
    </>
  );
}
