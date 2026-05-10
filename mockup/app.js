const STORAGE_KEY = 'taskmanagement_tasks';

const STATUSES = ['todo', 'in_progress', 'done'];

const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' };
const PRIORITY_RANK  = { high: 0, medium: 1, low: 2 };

const STATUS_NEXT = { todo: 'in_progress', in_progress: 'done' };
const STATUS_PREV = { in_progress: 'todo', done: 'in_progress' };

let tasks = [];
let editingId = null;
let sortModes = { todo: 'manual', in_progress: 'manual', done: 'manual' };

// ドラッグ状態
let dragId = null;
let dragSourceStatus = null;
let lastHoverCard = null;

// --- 初期データ ---
const DEMO_TASKS = [
  {
    id: 'demo-1',
    title: '要件定義書を作成する',
    description: 'お客さん向けの説明資料をまとめる',
    deadline: formatDate(daysFromToday(-2)),
    priority: 'high',
    status: 'done',
    createdAt: Date.now() - 3000,
    order: 0,
  },
  {
    id: 'demo-2',
    title: '画面モックを作る',
    description: 'HTML/CSS/JS でプロトタイプを作成して認識合わせを行う',
    deadline: formatDate(daysFromToday(1)),
    priority: 'medium',
    status: 'in_progress',
    createdAt: Date.now() - 2000,
    order: 0,
  },
  {
    id: 'demo-3',
    title: 'バックエンド技術を選定する',
    description: '',
    deadline: formatDate(daysFromToday(7)),
    priority: 'low',
    status: 'todo',
    createdAt: Date.now() - 1000,
    order: 0,
  },
];

// --- 起動 ---
(function init() {
  const saved = localStorage.getItem(STORAGE_KEY);
  tasks = saved ? JSON.parse(saved) : DEMO_TASKS.slice();
  initTaskOrders();
  renderAll();
})();

// localStorage から読んだ古いタスクに order がない場合に付与する
function initTaskOrders() {
  STATUSES.forEach(status => {
    const col = tasks.filter(t => t.status === status);
    col.sort((a, b) => b.createdAt - a.createdAt);
    col.forEach((t, i) => {
      if (t.order === undefined) t.order = i;
    });
  });
}

// --- 保存 ---
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// --- 並び替え ---
function sortByMode(list, status) {
  const arr = [...list];
  const mode = sortModes[status];
  if (mode === 'priority') {
    return arr.sort((a, b) => {
      const rd = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return rd !== 0 ? rd : (a.order ?? 0) - (b.order ?? 0);
    });
  }
  if (mode === 'deadline') {
    return arr.sort((a, b) => {
      if (!a.deadline && !b.deadline) return (a.order ?? 0) - (b.order ?? 0);
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline < b.deadline ? -1 : 1;
    });
  }
  return arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function getSortedTasks(status) {
  return sortByMode(tasks.filter(t => t.status === status), status);
}

function setSortMode(status, mode) {
  sortModes[status] = mode;
  renderAll();
}

function updateSortButtons(status) {
  ['manual', 'priority', 'deadline'].forEach(m => {
    const el = document.getElementById(`sort-${status}-${m}`);
    if (el) el.classList.toggle('active', m === sortModes[status]);
  });
}

// --- 全体再描画 ---
function renderAll() {
  STATUSES.forEach(status => {
    updateSortButtons(status);

    const list = document.getElementById('list-' + status);
    const sorted = getSortedTasks(status);
    document.getElementById('count-' + status).textContent = sorted.length;

    if (sortModes[status] === 'priority') {
      let html = '';
      let lastPriority = null;
      sorted.forEach(task => {
        if (task.priority !== lastPriority) {
          if (lastPriority !== null) html += '<div class="group-divider"></div>';
          html += `<div class="group-label priority-group-${task.priority}">${PRIORITY_LABEL[task.priority]}優先度</div>`;
          lastPriority = task.priority;
        }
        html += renderCard(task);
      });
      list.innerHTML = html;
    } else {
      list.innerHTML = sorted.map(renderCard).join('');
    }
  });
}

function renderCard(task) {
  const overdue = isOverdue(task.deadline);
  const deadlineHtml = task.deadline
    ? `<div class="card-deadline ${overdue ? 'overdue' : ''}">
        📅 ${task.deadline}${overdue ? '<span class="badge-overdue">期限切れ</span>' : ''}
       </div>`
    : '';
  const descHtml = task.description
    ? `<div class="card-desc">${escapeHtml(task.description)}</div>`
    : '';

  const prevBtn = STATUS_PREV[task.status]
    ? `<button class="btn-prev" onclick="moveTask('${task.id}','prev')">← 戻す</button>`
    : '';
  const nextBtn = STATUS_NEXT[task.status]
    ? `<button class="btn-next" onclick="moveTask('${task.id}','next')">進める →</button>`
    : '';

  return `
    <div class="card" data-id="${task.id}" data-priority="${task.priority}"
         draggable="true"
         ondragstart="onDragStart(event,'${task.id}','${task.status}')"
         ondragend="onDragEnd(event)">
      <div class="card-title-row">
        <span class="card-drag-handle" title="ドラッグして移動">⠿</span>
        <div class="card-title">${escapeHtml(task.title)}</div>
      </div>
      ${descHtml}
      ${deadlineHtml}
      <span class="priority-badge priority-${task.priority}">${PRIORITY_LABEL[task.priority]}</span>
      <div class="card-actions">
        <button class="btn-edit"   onclick="openEditModal('${task.id}')">編集</button>
        <button class="btn-delete" onclick="deleteTask('${task.id}')">削除</button>
        ${prevBtn}
        ${nextBtn}
      </div>
    </div>`;
}

// --- ドラッグ＆ドロップ ---
function onDragStart(event, id, sourceStatus) {
  // ボタン・フォーム部品のクリックはドラッグさせない
  if (event.target.closest('button, input, select, textarea')) {
    event.preventDefault();
    return;
  }
  dragId = id;
  dragSourceStatus = sourceStatus;
  event.dataTransfer.effectAllowed = 'move';
  const card = event.target.closest('.card');
  setTimeout(() => card && card.classList.add('dragging'), 0);
}

function onDragEnd(event) {
  const card = event.target.closest('.card');
  if (card) card.classList.remove('dragging');
  clearDropIndicators();
  dragId = null;
  dragSourceStatus = null;
  lastHoverCard = null;
}

function onDragOver(event, targetStatus) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';

  // 列のハイライト更新
  STATUSES.forEach(s => {
    document.getElementById('list-' + s).classList.toggle('drag-over', s === targetStatus);
  });

  // ホバーカードの境界線表示（変化があった場合のみ更新）
  const card = event.target.closest('.card[data-id]');
  if (card !== lastHoverCard) {
    if (lastHoverCard) lastHoverCard.classList.remove('drop-before', 'drop-after');
    lastHoverCard = card;
  }
  if (card && card.dataset.id !== dragId) {
    card.classList.remove('drop-before', 'drop-after');
    const rect = card.getBoundingClientRect();
    card.classList.add(event.clientY < rect.top + rect.height / 2 ? 'drop-before' : 'drop-after');
  }
}

function onDragLeave(event) {
  const list = event.currentTarget;
  if (!list.contains(event.relatedTarget)) {
    list.classList.remove('drag-over');
  }
}

function onDrop(event, targetStatus) {
  event.preventDefault();
  clearDropIndicators();

  if (!dragId) return;
  const task = tasks.find(t => t.id === dragId);
  if (!task) return;

  const isCrossColumn = task.status !== targetStatus;

  // 期限モードは列内の並び替えを無視（列間移動は許可）
  if (sortModes[targetStatus] === 'deadline' && !isCrossColumn) {
    dragId = null; dragSourceStatus = null;
    return;
  }

  // 列間移動の場合はステータスを更新
  if (isCrossColumn) task.status = targetStatus;

  // ドロップ対象カードと挿入位置を決定
  const targetCard = event.target.closest('.card[data-id]');
  const targetId = targetCard ? targetCard.dataset.id : null;

  // ターゲット列のタスク（ドラッグ中のカード除外）を並び替え順で取得
  const colTasks = tasks.filter(t => t.status === targetStatus && t.id !== dragId);
  const sortedCol = sortByMode(colTasks, targetStatus);

  let insertIdx;

  if (!targetId || targetId === dragId) {
    // 空きエリアへのドロップ → 末尾
    insertIdx = sortedCol.length;
  } else {
    const targetTask = tasks.find(t => t.id === targetId);
    const targetIdx = sortedCol.findIndex(t => t.id === targetId);
    const rect = targetCard.getBoundingClientRect();
    const isBefore = event.clientY < rect.top + rect.height / 2;

    if (!isCrossColumn && sortModes[targetStatus] === 'priority') {
      // 優先度モードの列内ドラッグ：同じ優先度グループ内のみ
      if (task.priority !== targetTask.priority) {
        // グループをまたぐ場合は自分の優先度グループの末尾へスナップ
        const ownGroupEnd = sortedCol.reduce((acc, t, i) =>
          t.priority === task.priority ? i + 1 : acc, 0);
        insertIdx = ownGroupEnd;
      } else {
        insertIdx = isBefore ? targetIdx : targetIdx + 1;
      }
    } else {
      insertIdx = isBefore ? targetIdx : targetIdx + 1;
    }
  }

  insertIdx = Math.max(0, Math.min(insertIdx, sortedCol.length));
  sortedCol.splice(insertIdx, 0, task);
  sortedCol.forEach((t, i) => { t.order = i; });

  save();
  renderAll();
  dragId = null;
  dragSourceStatus = null;
  lastHoverCard = null;
}

function clearDropIndicators() {
  STATUSES.forEach(s => {
    document.getElementById('list-' + s).classList.remove('drag-over');
  });
  if (lastHoverCard) {
    lastHoverCard.classList.remove('drop-before', 'drop-after');
    lastHoverCard = null;
  }
}

// --- タスク追加 ---
function addTask() {
  const title = document.getElementById('input-title').value.trim();
  const errEl = document.getElementById('form-error');

  if (!title) {
    showError(errEl, 'タイトルを入力してください');
    return;
  }
  if (title.length > 50) {
    showError(errEl, 'タイトルは50文字以内で入力してください');
    return;
  }
  errEl.hidden = true;

  // 先頭に追加するため最小 order より小さい値を付与
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const minOrder = todoTasks.length > 0 ? Math.min(...todoTasks.map(t => t.order ?? 0)) : 1;

  const task = {
    id: 'task-' + Date.now(),
    title,
    description: document.getElementById('input-desc').value.trim(),
    deadline: document.getElementById('input-deadline').value,
    priority: document.getElementById('input-priority').value,
    status: 'todo',
    createdAt: Date.now(),
    order: minOrder - 1,
  };

  tasks.unshift(task);
  save();
  renderAll();

  document.getElementById('input-title').value = '';
  document.getElementById('input-desc').value = '';
  document.getElementById('input-deadline').value = '';
  document.getElementById('input-priority').value = 'medium';
}

document.getElementById('input-title').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// --- タスク削除 ---
function deleteTask(id) {
  if (!confirm('このタスクを削除しますか？')) return;
  tasks = tasks.filter(t => t.id !== id);
  save();
  renderAll();
}

// --- ステータス移動（ボタン） ---
function moveTask(id, direction) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const next = direction === 'next' ? STATUS_NEXT[task.status] : STATUS_PREV[task.status];
  if (!next) return;

  task.status = next;
  // 移動先の先頭に挿入
  const destTasks = tasks.filter(t => t.status === next);
  task.order = destTasks.length > 0 ? Math.min(...destTasks.map(t => t.order ?? 0)) - 1 : 0;
  save();
  renderAll();
}

// --- 編集モーダル ---
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;

  document.getElementById('edit-title').value    = task.title;
  document.getElementById('edit-desc').value     = task.description;
  document.getElementById('edit-deadline').value = task.deadline;
  document.getElementById('edit-priority').value = task.priority;
  document.getElementById('edit-error').hidden   = true;

  document.getElementById('modal-overlay').hidden = false;
}

function closeModal() {
  document.getElementById('modal-overlay').hidden = true;
  editingId = null;
}

function closeModalOnOverlay(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function saveEdit() {
  const title = document.getElementById('edit-title').value.trim();
  const errEl = document.getElementById('edit-error');

  if (!title) {
    showError(errEl, 'タイトルを入力してください');
    return;
  }
  if (title.length > 50) {
    showError(errEl, 'タイトルは50文字以内で入力してください');
    return;
  }

  const task = tasks.find(t => t.id === editingId);
  if (!task) return;

  task.title       = title;
  task.description = document.getElementById('edit-desc').value.trim();
  task.deadline    = document.getElementById('edit-deadline').value;
  task.priority    = document.getElementById('edit-priority').value;

  save();
  renderAll();
  closeModal();
}

// --- ユーティリティ ---
function isOverdue(deadline) {
  if (!deadline) return false;
  return new Date(deadline) < new Date(new Date().toDateString());
}

function showError(el, msg) {
  el.textContent = msg;
  el.hidden = false;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function daysFromToday(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}
