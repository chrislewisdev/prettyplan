export function accordion(element) {
    const changes = element.parentElement.getElementsByClassName('changes');
    for (var i = 0; i < changes.length; i++) {
        toggleClass(changes[i], 'collapsed');
    }
}

export function toggleClass(element, className) {
    if (!element.className.match(className)) {
        element.className += ' ' + className;
    }
    else {
        element.className = element.className.replace(className, '');
    }
}

export function addClass(element, className) {
    if (!element.className.match(className)) element.className += ' ' + className;
}

export function removeClass(element, className) {
    element.className = element.className.replace(className, '');
}

export function expandAll() {
    const sections = document.querySelectorAll('.changes.collapsed');

    for (var i = 0; i < sections.length; i++) {
        toggleClass(sections[i], 'collapsed');
    }

    toggleClass(document.querySelector('.expand-all'), 'hidden');
    toggleClass(document.querySelector('.collapse-all'), 'hidden');
}

export function collapseAll() {
    const sections = document.querySelectorAll('.changes:not(.collapsed)');

    for (var i = 0; i < sections.length; i++) {
        toggleClass(sections[i], 'collapsed');
    }

    toggleClass(document.querySelector('.expand-all'), 'hidden');
    toggleClass(document.querySelector('.collapse-all'), 'hidden');
}

export function removeChildren(element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}

export function createModalContainer() {
    const modalElement = document.createElement('div');
    modalElement.id = 'modal-container';

    document.body.appendChild(modalElement);

    return modalElement;
}

export function closeModal() {
    const modalElement = document.getElementById('modal-container');
    document.body.removeChild(modalElement);
}