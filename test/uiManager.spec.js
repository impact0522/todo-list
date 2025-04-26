const { JSDOM } = require('jsdom');
const { expect } = require('chai');
const { UIManager, TodoManager, TodoItemFormatter } = require('../js/main');

describe('UIManager - Добавление задачи', () => {
    let dom, uiManager, todoManager;

    beforeEach(() => {
        // Создаем виртуальный DOM
        dom = new JSDOM(`
      <html>
        <body>
          <input class="input">
          <input class="schedule-date">
          <button class="add-task-button"></button>
          <div class="todos-list-body"></div>
          <div class="alert-message"></div>
        </body>
      </html>
    `);

        global.document = dom.window.document;
        global.localStorage = dom.window.localStorage;

        // Инициализируем менеджеры
        todoManager = new TodoManager(new TodoItemFormatter());
        uiManager = new UIManager(todoManager, new TodoItemFormatter());
    });

    it('должен корректно добавлять задачу и отображать её в списке', () => {
        // 1. Заполняем поля
        uiManager.taskInput.value = 'Проверить тесты';
        uiManager.dateInput.value = '2023-12-31';

        // 2. Вызываем добавление
        uiManager.handleAddTodo();

        // 3. Проверяем DOM
        const taskRow = document.querySelector('.todo-item');

        expect(taskRow).to.exist;
        expect(taskRow.textContent).to.include('Проверить тесты');
        expect(taskRow.textContent).to.include('2023-12-31');
        expect(taskRow.textContent).to.include('Pending');
    });
});