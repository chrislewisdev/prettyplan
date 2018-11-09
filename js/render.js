function clearExistingOutput() {
    removeChildren(document.getElementById('errors'));
    removeChildren(document.getElementById('warnings'));
    removeChildren(document.getElementById('actions'));
}

function hideParsingErrorMessage() {
    addClass(document.getElementById('parsing-error-message'), 'hidden');
}

function displayParsingErrorMessage() {
    removeClass(document.getElementById('parsing-error-message'), 'hidden');
}

function unHidePlan() {
    removeClass(document.getElementById('prettyplan'), 'hidden');
}

var components = {
    id: (id) => `
        <span class="id">
            ${id.prefixes.map(prefix => 
                `<span class="id-segment prefix">${prefix}</span>`
            ).join('')}
            <span class="id-segment type">${id.type}</span>
            <span class="id-segment name">${id.name}</span>
        </span>
    `,
    warning: (warning) => `
        <li>
            <span class="badge">warning</span>
            ${components.id(warning.id)}
            <span>${warning.detail}</span>
        </li>
    `
};

function render(plan) {
    if (plan.warnings) {
        var warningList = document.getElementById('warnings');
        warningList.innerHTML = `${plan.warnings.map(components.warning).join('')}`;
    }

    if (plan.actions) {
        var actionList = document.getElementById('actions');
        for (var i = 0; i < plan.actions.length; i++) {
            var action = createActionElement(plan.actions[i]);
            actionList.appendChild(action);
        }
    }
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

    var oldValue;
    if (change.old) {
        oldValue = createChangeRowValueElement('old-value', change.old);
    }
    else {
        oldValue = createChangeRowValueElement('old-value', '');
    }

    var newValue = createChangeRowValueElement('new-value', change.new);

    var row = document.createElement('tr');
    row.appendChild(property);
    row.appendChild(oldValue);
    row.appendChild(newValue);

    return row;
}

function createChangeRowValueElement(type, value) {
    var element = document.createElement('td');
    element.className = type;

    if (value.indexOf('\\n') >= 0 || value.indexOf('\\"') >= 0) {
        var pre = document.createElement('pre');

        var sanitisedValue = value.replace(new RegExp('\\\\n', 'g'), '\n')
            .replace(new RegExp('\\\\"', 'g'), '"');

        sanitisedValue = prettifyJson(sanitisedValue);

        pre.innerHTML = sanitisedValue;

        element.appendChild(pre);
    }
    else {
        element.innerHTML = value;
    }

    return element;
}

function prettifyJson(json) {
    try {
        return JSON.stringify(JSON.parse(json), null, 2);
    }
    catch (e) {
        return json;
    }
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

function handleSummaryToggle(element) {
    return function () {
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

    for (var i = 0; i < id.prefixes.length; i++) {
        var prefixElement = document.createElement('span');
        prefixElement.className = 'id-segment prefix';
        prefixElement.innerText = id.prefixes[i];
        idElement.appendChild(prefixElement);
    }

    var typeElement = document.createElement('span');
    typeElement.className = 'id-segment type';
    typeElement.innerText = id.type;
    idElement.appendChild(typeElement);

    var nameElement = document.createElement('span');
    nameElement.className = 'id-segment name';
    nameElement.innerText = id.name;
    idElement.appendChild(nameElement);

    return idElement;
}

function createBadgeElement(label) {
    var badge = document.createElement('span');
    badge.className = 'badge';
    badge.innerText = label;
    return badge;
}