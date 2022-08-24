// idGenerator
    const inc = (init = 0) => () => ++init;
    const genId = inc();
// /idGenerator

const db = [
    {id: genId(), name: 'Увімкнути тахометр', description: 'Інакше буде боляче', done: true, due_date: new Date('2022-08-22'), list_id: 1},
    {id: genId(), name: 'Доробити верстку макету', done: false, due_date: new Date('2022-08-20'), list_id: 1},
    {id: genId(), name: 'Піти додому', description: 'Інакше мене закриють у офісі', done: false, due_date: new Date('2022-08-24'), list_id: 1},
];

// default markup elements
    const navBar = document.querySelector('.header__nav');
    const tasksBlock = document.querySelector('.content');
    const taskTemplate = document.querySelector('.task-template');
// /default markup elements

// navBar functionality
    const navButtons = navBar.querySelectorAll('.header__nav-link');
    navButtons.forEach(btn => btn.addEventListener('click', navButtonHandler));
// /navBar functionality

// modal functionality
    const modalBg = document.querySelector('.addTask-modal');
    // open modal
        const openModalBtn = document.querySelector('.header__btn-open-modal');
        openModalBtn.addEventListener('click', openModalBtnHandler);
    // /open modal

    // close modal
        const modalCloseButtons = modalBg.querySelectorAll('.addTask-modal__close-btn');
        modalCloseButtons.forEach(btn => btn.addEventListener('click', closeModalBtnHandler));

        modalBg.addEventListener('click', e => {
            if (e.target.classList.contains('addTask-modal')) closeModalBtnHandler()
        })
    // /close modal

    // addTask
        const taskForm = document.forms['addTask'];
        taskForm.addEventListener('submit', e => {
            e.preventDefault();
            const formData = new FormData(taskForm);
            const task = Object.fromEntries([...formData.entries(), ['done', false], ['list_id', '1']]);
            if (!taskFormValidation(task, taskForm)) return;

            taskForm.name.classList.remove('invalid');
            taskForm.reset();
            db.push(task)
            renderOneTask(task);
        })
    // /addTask
// /modal functionality

// toDoList render
    renderAllTasks();
// /toDoList render

// render functions
    function renderAllTasks() {
        db.forEach(renderOneTask);
    };

    function renderOneTask (task) {
        if ('content' in document.createElement('template')) {
            const taskTemplateClone = taskTemplate.content.cloneNode(true);

            // components of template
                const taskEl = taskTemplateClone.querySelector('.task');
                const taskTitle = taskTemplateClone.querySelector('.task__body-title');
                const taskDesc = taskTemplateClone.querySelector('.task__body-desc');
                const taskDate = taskTemplateClone.querySelector('.task__deadline-date');
                const taskCheckbox = taskTemplateClone.querySelector('.task__body-checkbox');
                const taskRemove = taskTemplateClone.querySelector('.task__remove');
            // /components of template


            task.due_date = dateValidation(new Date(task.due_date));

            taskTitle.textContent = task.name;
            taskDesc.textContent = task.description || '';
            taskDate.textContent = task.due_date ? task.due_date.toISOString().split('T')[0] : '';

            // functionality on events of components
                taskCheckbox.addEventListener('change', (e) => checkboxHandler(e, task, taskEl));
                taskRemove.addEventListener('click', () => removeBtnHandler(task, taskEl));
            // /functionality on events of components
            stateCheck(task.due_date, task.done, taskEl, taskCheckbox)

            return tasksBlock.appendChild(taskEl);
        } else {
            console.log('tag <template> is not supported by this browser');
        };
    };
// /render functions

// handlers
    function navButtonHandler(e) {

        tasksBlock.innerHTML = '';
        tasksBlock.classList.remove('show-all');
        tasksBlock.classList.remove('show-done');
        tasksBlock.classList.remove('show-unDone');
        tasksBlock.classList.add(e.target.value);
        
        renderAllTasks();
        navButtons.forEach(btn => btn.classList.remove('is-active'));
        e.target.classList.add('is-active');
    };

    function checkboxHandler(e, task, taskEl) {
        db[db.indexOf(task)].done = e.target.checked;
        taskEl.replaceWith(renderOneTask(db[db.indexOf(task)]));
    };

    function removeBtnHandler(task, taskEl) {
        db.splice(db.indexOf(task), 1);
        console.log(db);
        return taskEl.remove();
    };

    function openModalBtnHandler() {
        modalBg.classList.add('is-active');
    };

    function closeModalBtnHandler() {
        modalBg.classList.remove('is-active');
    };
// /handlers

// service functions
    function stateCheck(date, done, content, checkbox) {
        const now = new Date();
        const today = new Date(now.toISOString().split('T')[0] + 'T00:00:00');

        if (done === true) {
            content.classList.add('done');
            checkbox.checked = true;
        }
        else if (date < today && date !== '') {
            content.classList.add('overdue');
        }
        else return;
    };

    function dateValidation(date) {
        if (date == 'Invalid Date') date = '';
        return date;
    };

    function taskFormValidation(task, form) {
        if (!task.name) {
            console.log(form);
            console.log(form.name);
            form.name.classList.add('invalid');
            return false;
        } else return true;
    };
// /service functions
