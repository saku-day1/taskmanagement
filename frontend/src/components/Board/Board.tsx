import { useEffect, useState } from 'react';
import type { Status, Task } from '../../types/task';
import { fetchTasks } from '../../api/taskApi';
import BoardColumn from '../BoardColumn/BoardColumn';
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

  return (
    <>
      <div className="board-toolbar">
        <input
          className="search-input"
          type="search"
          placeholder="タイトル・説明で検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="board">
        {COLUMNS.map((col) => (
          <BoardColumn
            key={col.status}
            label={col.label}
            tasks={filtered.filter((t) => t.status === col.status)}
          />
        ))}
      </div>
    </>
  );
}
