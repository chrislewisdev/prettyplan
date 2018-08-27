function accordion(element)
{
    var changes = element.parentElement.getElementsByClassName('changes');
    for (var i = 0; i < changes.length; i++)
    {
        toggleClass(changes[i], 'collapsed');
    }
}

function toggleClass(element, className) 
{
    if (!element.className.match(className)) 
    {
        element.className += ' ' + className;
    }
    else
    {
        element.className = element.className.replace(className, '');
    }
}

function addClass(element, className)
{
    if (!element.className.match(className)) element.className += ' ' + className;
}

function removeClass(element, className)
{
    element.className = element.className.replace(className, '');
}

function expandAll()
{
    var sections = document.querySelectorAll('.changes.collapsed');

    for (var i = 0; i < sections.length; i++)
    {
        toggleClass(sections[i], 'collapsed');
    }

    toggleClass(document.querySelector('.expand-all'), 'hidden');
    toggleClass(document.querySelector('.collapse-all'), 'hidden');
}

function collapseAll()
{
    var sections = document.querySelectorAll('.changes:not(.collapsed)');
    
    for (var i = 0; i < sections.length; i++)
    {
        toggleClass(sections[i], 'collapsed');
    }
    
    toggleClass(document.querySelector('.expand-all'), 'hidden');
    toggleClass(document.querySelector('.collapse-all'), 'hidden');
}