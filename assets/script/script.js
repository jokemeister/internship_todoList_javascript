// database
    const tasksEndpoint = 'http://localhost:3000/tasks';
    const listsEndpoint = 'http://localhost:3000/lists';

// database

// default markup elements
    const loaderTemplate = document.querySelector('.loader-template');
    // main
    const navBar = document.querySelector('.header__nav');
    const tasksBlock = document.querySelector('.content');
    const taskTemplate = document.querySelector('.task-template');

    // sidebar list
    const asideListsBlock = document.querySelector('.sidebar__list');
    const listTemplate = document.querySelector('.sidebar__list-item-template');
    const defaultList = document.querySelector('.default-list');
    // modal selector
    const selectorListsBlock = document.querySelector('.addTask__form__list-selector');
// /default markup elements

// first render
async function firstRender() {
    addLoader(tasksBlock);
    await getLists(listsEndpoint);
    await getTasks(tasksEndpoint);

    defaultList.addEventListener('click', e => {
        listChooseHandler(e);
        getTasks(tasksEndpoint);
    })
};

firstRender();

// /first render

// sidebar functionality
    const listForm = document.forms['list'];
    listForm.addEventListener('submit', createListHandler)
// sidebar functionality

// navBar functionality
    const navButtons = navBar.querySelectorAll('.header__nav-link');
    navButtons.forEach(btn => btn.addEventListener('click', navButtonHandler));
// /navBar functionality

// modal functionality
    const modalBg = document.querySelector('.addTask-modal');
    const modalContent = modalBg.querySelector('.addTask-modal-content');
    
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
            const task = Object.fromEntries(formData.entries());
            task.done = false;
            if (!formValidation(task, taskForm)) return;
            task.due_date = dateValidation(task.due_date);
            taskForm.name.classList.remove('invalid');
            addLoader(modalContent);
            createTask(task)
                .then(renderOneTask);
            taskForm.reset();
            removeLoader(modalContent);
        })
    // /addTask
// /modal functionality

// render functions
    function renderAllLists(db, parent) {
        db.forEach(list => renderOneList(list, parent));
    };

    function renderOneList(list, parent) {
        let listEl;
        // render lists for sidebar
        if (parent === asideListsBlock) {
            const listTemplateClone = listTemplate.content.cloneNode(true);
            listEl = listTemplateClone.querySelector('.sidebar__list-item');
            const listTitle = listTemplateClone.querySelector('.sidebar__list-item__title');
            const listRemoveBtn = listTemplateClone.querySelector('.list__remove')

            listEl.addEventListener('click', e => listChooseHandler(e, list));
            listRemoveBtn.addEventListener('click', () => listDeleteHandler(list, listEl));

            listTitle.textContent = list.name;
        // render lists for selector in modal
        } else if (parent === selectorListsBlock) {
            listEl = document.createElement('option')
            listEl.classList.add('addTask__form__list-selector__option');
            listEl.textContent = list.name;
            listEl.value = list.id;
        }

        parent.append(listEl);
    };

    function renderAllTasks(db) {
        tasksBlock.innerHTML = '';
        db.forEach(renderOneTask);
    };

    function renderOneTask(task) {
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
                taskCheckbox.addEventListener('change', e => checkboxHandler(e, task, taskEl));
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
    async function createListHandler(e) {
        e.preventDefault();
        let list = {name: listForm.name.value}
        if (!formValidation(list, listForm)) return;
        createList(list);
        renderOneList(list, asideListsBlock);
        listForm.reset();
    }

    async function listChooseHandler(e, list) {
        const allLists = asideListsBlock.querySelectorAll('.sidebar__list-item')
        allLists.forEach(list => list.classList.remove('is-active'));

        e.currentTarget.classList.add('is-active');
        if (list) await getOneList(listsEndpoint, list.id);
    }

    async function listDeleteHandler(list, listEl) {
        await deleteList(list.id)
        listEl.remove();
    }

    function navButtonHandler(e) {
        tasksBlock.classList.remove('show-all');
        tasksBlock.classList.remove('show-done');
        tasksBlock.classList.remove('show-unDone');
        tasksBlock.classList.add(e.target.value);
        
        navButtons.forEach(btn => btn.classList.remove('is-active'));
        e.target.classList.add('is-active');
    };

    async function checkboxHandler(e, task, taskEl) {
        task = await checkTask(e, task.id);

        let newTaskEl = renderOneTask(task)
        taskEl.replaceWith(newTaskEl);
    };

    async function removeBtnHandler(task, taskEl) {
        await deleteTask(task.id)
        taskEl.remove();
    };

    function openModalBtnHandler() {
        modalBg.classList.add('is-active');
    };

    function closeModalBtnHandler() {
        modalBg.classList.remove('is-active');
    };
// /handlers

// request functions
    async function getLists(url) {
        let response = await fetch(url);
        let result = await handleError(response).json();
        renderAllLists(result, asideListsBlock)
        renderAllLists(result, selectorListsBlock)
    }

    async function getOneList(url, listId) {
        url += `/${listId}/tasks?all=true`;
        let response = await fetch(url);
        let result = await handleError(response).json();
        await renderAllTasks(result)
    }

    async function createList(list) {
        let response = await fetch(listsEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(list)
        })
        let result = await handleError(response).json()
        return result;
    }

    async function deleteList(listId) {
        let response = await fetch(`${listsEndpoint}/${listId}`, { method: 'DELETE' });
        let result = await handleError(response).json()
        return result[0];
    }
    
    async function getTasks(url) {
        let response = await fetch(url);
        let result = await handleError(response).json();
        renderAllTasks(result);
    }

    async function createTask(task) {
        let response = await fetch(tasksEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        })
        let result = await handleError(response).json();
        return result;
    }

    async function checkTask(e, taskId) {
        let response = await fetch(`${tasksEndpoint}/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "done": e.target.checked })
        })
        let result = await handleError(response).json()
        return result;
    }

    async function getTaskById(taskId) {
        let response = await fetch(`${tasksEndpoint}/${taskId}`)
        let result = await handleError(response).json()
        return result[0];
    }

    async function deleteTask(taskId) {
        let response = await fetch(`${tasksEndpoint}/${taskId}`, { method: 'DELETE' });
        let result = await handleError(response).json()
        return result[0];
    }
// /request functions

// service functions
    function addLoader(parent) {
        const loaderTemplateClone = loaderTemplate.content.cloneNode(true);

        // components of template
            const loaderEl = loaderTemplateClone.querySelector('.loader-bg');
        parent.append(loaderEl);
    }

    function removeLoader(parent) {
        const loaderEl = parent.querySelector('.loader-bg');
        loaderEl.remove();
    }

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
        if (new Date(date) == 'Invalid Date') date = '9999-12-31';
        return date;
    };

    function formValidation(model, form) {
        if (!model.name) {
            form.name.classList.add('invalid');
            return false;
        } else {
            return true;
        }
    };

    function handleError(res) {
        if(res.ok) {
            return res;
        } else throw Error(res.status + ': ' + res.statusText);
    }
// /service functions

