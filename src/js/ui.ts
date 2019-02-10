export function accordion(element: Element): void {
    const changes = element.parentElement.getElementsByClassName('changes');
    for (var i = 0; i < changes.length; i++) {
        toggleClass(changes[i], 'collapsed');
    }
}

export function toggleClass(element: Element, className: string): void {
    if (!element.className.match(className)) {
        element.className += ' ' + className;
    }
    else {
        element.className = element.className.replace(className, '');
    }
}

export function addClass(element: Element, className: string): void {
    if (!element.className.match(className)) element.className += ' ' + className;
}

export function removeClass(element: Element, className: string): void {
    element.className = element.className.replace(className, '');
}

export function expandAll(): void {
    const sections = document.querySelectorAll('.changes.collapsed');

    for (var i = 0; i < sections.length; i++) {
        toggleClass(sections[i], 'collapsed');
    }

    toggleClass(document.querySelector('.expand-all'), 'hidden');
    toggleClass(document.querySelector('.collapse-all'), 'hidden');
}

export function collapseAll(): void {
    const sections = document.querySelectorAll('.changes:not(.collapsed)');

    for (var i = 0; i < sections.length; i++) {
        toggleClass(sections[i], 'collapsed');
    }

    toggleClass(document.querySelector('.expand-all'), 'hidden');
    toggleClass(document.querySelector('.collapse-all'), 'hidden');
}

export function removeChildren(element: Element): void {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}

export function createModalContainer(): HTMLElement {
    const modalElement = document.createElement('div');
    modalElement.id = 'modal-container';

    document.body.appendChild(modalElement);

    return modalElement;
}

export function closeModal(): void {
    const modalElement = document.getElementById('modal-container');
    document.body.removeChild(modalElement);
}