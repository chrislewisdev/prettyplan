function render(plan)
{
    if (plan.warnings)
    {
        var warningList = document.getElementById('warnings');
        for (var i = 0; i < plan.warnings.length; i++)
        {
            var warning = createWarningElement(plan.warnings[i], warningList);
            warningList.appendChild(warning);
        }
    }
    
    if (plan.actions)
    {
        var actionList = document.getElementById('actions');
        for (var i = 0; i < plan.actions.length; i++)
        {
            var action = createActionElement(plan.actions[i]);
            actionList.appendChild(action);
        }
    }
}

function createWarningElement(warning) 
{
    var badge = createBadgeElement('warning');
    
    var id = createIdElement(warning.id);
    
    var detail = document.createElement('span');
    detail.innerText = warning.detail;
    
    var warningElement = document.createElement('li');
    warningElement.appendChild(badge);
    warningElement.appendChild(id);
    warningElement.appendChild(detail);
    
    return warningElement;
}

function createActionElement(action) {
    var badge = createBadgeElement(action.type);
    
    var id = createIdElement(action.id);
    
    var changeCount = createChangeCountElement(action.changes ? action.changes.length : 0);
    
    var heading = createActionSummaryElement(badge, id, changeCount);
    
    var changesTable = document.createElement('table');
    for (var i = 0; i < action.changes.length; i++) {
        var row = createChangeRowElement(action.changes[i]);
        changesTable.appendChild(row);
    }
    
    var changes = document.createElement('div');
    changes.className = 'changes collapsed';
    changes.appendChild(changesTable);
    
    var actionElement = document.createElement('li');
    actionElement.className = action.type;
    actionElement.appendChild(heading);
    actionElement.appendChild(changes);
    
    return actionElement;
}

function createChangeRowElement(change) {
    var property = document.createElement('td');
    property.className = 'property';
    property.innerText = change.property;
    
    if (change.old) {
        var oldValue = createChangeRowValueElement('old-value', change.old);
    }
    
    var newValue = createChangeRowValueElement('new-value', change.new);
    
    var row = document.createElement('tr');
    row.appendChild(property);
    if (change.old) row.appendChild(oldValue);
    row.appendChild(newValue);
    
    return row;
}

function createChangeRowValueElement(type, value) {
    var element = document.createElement('td');
    element.className = type;
    
    if (value.indexOf('\\n') >= 0 || value.indexOf('\\"') >= 0) {
        var pre = document.createElement('pre');
        pre.innerHTML = value;
        pre.innerHTML = pre.innerHTML.replace(new RegExp('\\\\n', 'g'), '\n');
        pre.innerHTML = pre.innerHTML.replace(new RegExp('\\\\"', 'g'), '"');
        element.appendChild(pre);
    }
    else {
        element.innerHTML = value;
    }
    
    return element;
}

function createActionSummaryElement(badge, id, changeCount) {
    var summary = document.createElement('div');
    summary.className = 'summary';
    summary.onclick = handleSummaryToggle(summary);
    summary.appendChild(badge);
    summary.appendChild(id);
    summary.appendChild(changeCount);
    
    return summary;
}

function handleSummaryToggle(element)
{
    return function () 
    {
        accordion(element);
    };
}

function createChangeCountElement(changeCount) {
    var changeCountElement = document.createElement('span');
    changeCountElement.className = 'change-count';
    if (changeCount > 0) {
        changeCountElement.innerText = ' ' + changeCount + ' change';
        if (changeCount != 1)
        changeCountElement.innerText += 's';
    }
    return changeCountElement;
}

function createIdElement(id) {
    var idElement = document.createElement('span');
    idElement.className = 'id';
    idElement.innerText = id;
    return idElement;
}

function createBadgeElement(label) {
    var badge = document.createElement('span');
    badge.className = 'badge';
    badge.innerText = label;
    return badge;
}