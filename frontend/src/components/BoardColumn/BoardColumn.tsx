import type { Task } from '../../types/task';
import TaskCard from '../TaskCard/TaskCard';
import './BoardColumn.css';

interface Props {
  label: string;
  tasks: Task[];
}

export default function BoardColumn({ label, tasks }: Props) {
  return (
    <div className="column">
      <div className="column-header">
        <span className="column-label">{label}</span>
        <span className="column-count">{tasks.length}</span>
      </div>
      <div className="column-body">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="column-empty">タスクはありません</p>
        )}
      </div>
    </div>
  );
}
