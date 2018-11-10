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

function showReleaseNotification() {
    removeClass(document.getElementById('release-notification'), 'hidden');
}

function render(plan) {
    if (plan.warnings) {
        const warningList = document.getElementById('warnings');
        warningList.innerHTML = plan.warnings.map(components.warning).join('');
    }

    if (plan.actions) {
        const actionList = document.getElementById('actions');
        actionList.innerHTML = plan.actions.map(components.action).join('');
    }
}

const components = {
    badge: (label) => `
        <span class="badge">${label}</span>
    `,

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
            ${components.badge('warning')}
            ${components.id(warning.id)}
            <span>${warning.detail}</span>
        </li>
    `,

    changeCount: (count) => `
        <span class="change-count">
            ${count + ' change' + (count > 1 ? 's' : '')}
        </span>
    `,

    change: (change) => `
        <tr>
            <td class="property">${change.property}</td>
            <td class="old-value">${change.old ? prettify(change.old) : ''}</td>
            <td class="new-value">${prettify(change.new)}</td>
        </tr>
    `,

    action: (action) => `
        <li class="${action.type}">
            <div class="summary" onclick="accordion(this)">
                ${components.badge(action.type)}
                ${components.id(action.id)}
                ${action.changes ? components.changeCount(action.changes.length) : ''}
            </div>
            <div class="changes collapsed">
                <table>
                    ${action.changes.map(components.change).join('')}
                </table>
            </div>
        </li>
    `
};

function prettify(value) {
    if (value.indexOf('\\n') >= 0 || value.indexOf('\\"') >= 0) {
        var sanitisedValue = value.replace(new RegExp('\\\\n', 'g'), '\n')
                                    .replace(new RegExp('\\\\"', 'g'), '"');
        
        sanitisedValue = prettifyJson(sanitisedValue);
        return `<pre>${sanitisedValue}</pre>`;
    }
    else {
        return value;
    }
}

function prettifyJson(maybeJson) {
    try {
        return JSON.stringify(JSON.parse(maybeJson), null, 2);
    }
    catch (e) {
        return maybeJson;
    }
}