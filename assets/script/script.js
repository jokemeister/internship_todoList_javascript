const toDoList = [
    {name: 'Увімкнути тахометр', description: 'Інакше буде боляче', done: true, due_date: '2022-08-22', list_id: 1},
    {name: 'Доробити верстку макету', done: false, due_date: '2022-08-20', list_id: 1},
    {name: 'Піти додому', description: 'Інакше мене закриють у офісі', done: false, due_date: '2022-08-22', list_id: 1}
]

const tasksBlock = document.querySelector('.js--hero__block');
const taskTemplate = document.querySelector('.js--task__template');

function renderTask (task) {
    if ('content' in document.createElement('template')) {
        const taskEl = taskTemplate.content.cloneNode(true);

        // components of template
            const taskContent = taskEl.querySelector('.js--task__content');
            const taskTitle = taskEl.querySelector('.js--task__title');
            const taskDesc = taskEl.querySelector('.js--task__desc');
            const taskDate = taskEl.querySelector('.js--task__date');
            const taskCheckbox = taskEl.querySelector('.js--task__checkbox');
        // /components of template

        taskTitle.textContent = task.name;
        taskDesc.textContent = task.description || '';
        taskDate.textContent = task.due_date || '';
        let taskDone = task.done;

        stateCheck(task.due_date, task.done, taskContent, taskCheckbox)

        return tasksBlock.appendChild(taskEl);
      } else {
        console.log('tag <template> is not supported by this browser');
      }
}

function stateCheck(date, done, content, checkbox) {
    if (done === true) {
        content.classList.add('done');
        checkbox.setAttribute('checked', 'true');
    }
    else if (new Date(date + 'T23:59:59') < new Date()) {
        content.classList.add('overdue');
    }
    else return;
}

function renderAllTasks(db) {
    db.map((task) => renderTask(task));
};

renderAllTasks(toDoList);