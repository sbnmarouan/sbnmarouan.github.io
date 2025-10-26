// modules/todos.js — ToDo List (CRUD + filtres + persistence + dnd)
(() => {
  const ROOT = document.querySelector('[data-todo-root]') || document.getElementById('todo');
  if (!ROOT) return;

  const STORAGE_KEY = 'portfolio:todos:v1';
  const form   = ROOT.querySelector('[data-todo-form]');
  const input  = ROOT.querySelector('[data-todo-input]');
  const list   = ROOT.querySelector('[data-todo-list]');
  const counter= ROOT.querySelector('[data-todo-counter]');
  const clear  = ROOT.querySelector('[data-todo-clear]');
  const filtersWrap = ROOT.querySelector('[data-todo-filters]');

  if (!form || !input || !list) return;

  let todos = load();
  let currentFilter = (filtersWrap?.querySelector('.is-active')?.dataset.filter) || 'all';

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); } catch {}
  }

  const uid = () => Math.random().toString(36).slice(2, 10);
  const sanitize = (s) => (s || '').trim();
  const visibleByFilter = (t) =>
    currentFilter === 'all' ? true :
    currentFilter === 'active' ? !t.done :
    currentFilter === 'completed' ? t.done : true;

  function render() {
    list.innerHTML = '';
    todos.forEach((t) => {
      if (!visibleByFilter(t)) return;

      const li = document.createElement('li');
      li.className = 'todo-item';
      li.draggable = true;
      li.dataset.id = t.id;

      li.innerHTML = `
        <label class="todo-check">
          <input type="checkbox" ${t.done ? 'checked' : ''} aria-label="Marquer comme ${t.done ? 'à faire' : 'terminé'}">
          <span class="tick" aria-hidden="true"></span>
        </label>
        <span class="todo-text" tabindex="0"></span>
        <input class="todo-edit" type="text" value="">
        <div class="todo-actions">
          <button class="btn-todo edit" aria-label="Éditer la tâche">✎</button>
          <button class="btn-todo delete" aria-label="Supprimer la tâche">✕</button>
        </div>
      `;

      li.querySelector('.todo-text').textContent = t.text;
      li.querySelector('.todo-edit').value = t.text;

      // Toggle
      li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
        t.done = e.target.checked;
        save(); render();
      });

      // Delete
      li.querySelector('.delete').addEventListener('click', () => {
        todos = todos.filter(x => x.id !== t.id);
        save(); render();
      });

      // Éditer
      const startEdit = () => {
        li.classList.add('is-editing');
        const ed = li.querySelector('.todo-edit');
        ed.value = t.text;
        ed.focus();
        ed.select();
      };
      li.querySelector('.edit').addEventListener('click', startEdit);
      li.querySelector('.todo-text').addEventListener('dblclick', startEdit);

      const finishEdit = (commit) => {
        const ed = li.querySelector('.todo-edit');
        if (commit) {
          const val = sanitize(ed.value);
          if (val) {
            t.text = val;
            save();
          }
        }
        li.classList.remove('is-editing');
        render();
      };
      li.querySelector('.todo-edit').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finishEdit(true);
        if (e.key === 'Escape') finishEdit(false);
      });
      li.querySelector('.todo-edit').addEventListener('blur', () => finishEdit(true));

      // Drag & drop
      li.addEventListener('dragstart', (e) => {
        li.classList.add('dragging');
        e.dataTransfer.setData('text/plain', t.id);
        e.dataTransfer.effectAllowed = 'move';
      });
      li.addEventListener('dragend', () => li.classList.remove('dragging'));

      list.appendChild(li);
    });

    if (counter) {
      counter.textContent = `${todos.filter(t => !t.done).length} restant(s)`;
      counter.setAttribute('aria-live', 'polite');
    }
    if (clear) clear.hidden = todos.every(t => !t.done);
  }

  // Drop target
  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const dragging = list.querySelector('.dragging');
    const afterEl = getDragAfterElement(list, e.clientY);
    if (!dragging) return;
    if (afterEl == null) list.appendChild(dragging);
    else list.insertBefore(dragging, afterEl);
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    const order = [...list.querySelectorAll('.todo-item')].map(li => li.dataset.id);
    todos.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    save(); render();
  });

  function getDragAfterElement(container, y) {
    const els = [...container.querySelectorAll('.todo-item:not(.dragging)')];
    return els.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      return (offset < 0 && offset > closest.offset) ? {offset, element: child} : closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  // Add
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = sanitize(input.value);
    if (!text) return;
    todos.push({ id: uid(), text, done: false, createdAt: Date.now() });
    input.value = '';
    save(); render();
  });

  // Clear completed
  clear?.addEventListener('click', () => {
    todos = todos.filter(t => !t.done);
    save(); render();
  });

  // Filters
  if (filtersWrap) {
    filtersWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      filtersWrap.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentFilter = btn.dataset.filter || 'all';
      render();
    });
  }

  render();
})();
