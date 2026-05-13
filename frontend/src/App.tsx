import Board from './components/Board/Board';

export default function App() {
  return (
    <div>
      <header className="app-header">
        <h1>タスク管理</h1>
      </header>
      <main>
        <Board />
      </main>
    </div>
  );
}
