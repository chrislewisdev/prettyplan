function accordion(element) {
    const changes = element.parentElement.getElementsByClassName('changes');
    for (var i = 0; i < changes.length; i++) {
        toggleClass(changes[i], 'collapsed');
    }
}

function toggleClass(element, className) {
    if (!element.className.match(className)) {
        element.className += ' ' + className;
    }
    else {
        element.className = element.className.replace(className, '');
    }
}

function addClass(element, className) {
    if (!element.className.match(className)) element.className += ' ' + className;
}

function removeClass(element, className) {
    element.className = element.className.replace(className, '');
}

function expandAll() {
    const sections = document.querySelectorAll('.changes.collapsed');

    for (var i = 0; i < sections.length; i++) {
        toggleClass(sections[i], 'collapsed');
    }

    toggleClass(document.querySelector('.expand-all'), 'hidden');
    toggleClass(document.querySelector('.collapse-all'), 'hidden');
}

function collapseAll() {
    const sections = document.querySelectorAll('.changes:not(.collapsed)');

    for (var i = 0; i < sections.length; i++) {
        toggleClass(sections[i], 'collapsed');
    }

    toggleClass(document.querySelector('.expand-all'), 'hidden');
    toggleClass(document.querySelector('.collapse-all'), 'hidden');
}

function removeChildren(element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}

function createModalContainer() {
    const modalElement = document.createElement('div');
    modalElement.id = 'modal-container';

    document.body.appendChild(modalElement);

    return modalElement;
}

function closeModal() {
    const modalElement = document.getElementById('modal-container');
    document.body.removeChild(modalElement);
}