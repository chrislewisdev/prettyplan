import { Plan, Action, Diff, Warning, ResourceId } from './parse'
import { removeChildren, addClass, removeClass, createModalContainer } from './ui';
import { Release, getReleases } from './releases';

export function clearExistingOutput(): void {
    removeChildren(document.getElementById('errors'));
    removeChildren(document.getElementById('warnings'));
    removeChildren(document.getElementById('actions'));
}

export function hideParsingErrorMessage(): void {
    addClass(document.getElementById('parsing-error-message'), 'hidden');
}

export function displayParsingErrorMessage(): void {
    removeClass(document.getElementById('parsing-error-message'), 'hidden');
}

export function unHidePlan(): void {
    removeClass(document.getElementById('prettyplan'), 'hidden');
}

export function showReleaseNotification(version: string): void {
    const notificationElement = document.getElementById('release-notification');
    notificationElement.innerHTML = components.releaseNotification(version);
    removeClass(notificationElement, 'hidden');
}

export function hideReleaseNotification(): void {
    addClass(document.getElementById('release-notification'), 'dismissed');
}

export function showReleaseNotes(): void {
    createModalContainer().innerHTML = components.modal(components.releaseNotes(getReleases()));
}

export function render(plan: Plan): void {
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
    badge: (label: string): string => `
        <span class="badge">${label}</span>
    `,

    id: (id: ResourceId): string => `
        <span class="id">
            ${id.prefixes.map(prefix => 
                `<span class="id-segment prefix">${prefix}</span>`
            ).join('')}
            <span class="id-segment type">${id.type}</span>
            <span class="id-segment name">${id.name}</span>
        </span>
    `,

    warning: (warning: Warning): string => `
        <li>
            ${components.badge('warning')}
            ${components.id(warning.id)}
            <span>${warning.detail}</span>
        </li>
    `,

    diffCount: (count: number): string => `
        <span class="change-count">
            ${count + ' change' + (count > 1 ? 's' : '')}
        </span>
    `,

    diff: (diff: Diff): string => `
        <tr>
            <td class="property">
                ${diff.property}
                ${diff.forcesNewResource ? `<br /><span class="forces-new-resource">(forces new resource)</span>` : ''}
            </td>
            <td class="old-value">${diff.old ? prettify(diff.old) : ''}</td>
            <td class="new-value">${prettify(diff.new)}</td>
        </tr>
    `,

    action: (action: Action): string => `
        <li class="${action.type}">
            <div class="summary" onclick="accordion(this)">
                ${components.badge(action.type)}
                ${components.id(action.id)}
                ${action.diffs ? components.diffCount(action.diffs.length) : ''}
            </div>
            <div class="changes collapsed">
                <table>
                    ${action.diffs.map(components.diff).join('')}
                </table>
            </div>
        </li>
    `,

    modal: (content: string): string => `
        <div class="modal-pane" onclick="closeModal()"></div>
        <div class="modal-content">
            <div class="modal-close"><button class="text-button" onclick="closeModal()">close</button></div>
            ${content}
        </div>
    `,

    releaseNotes: (releases: Release[]): string => `
        <div class="release-notes">
            <h1>Release Notes</h1>
            ${releases.map(components.release).join('')}
        </div>
    `,

    release: (release: Release): string => `
        <h2>${release.version}</h2>
        <ul>
            ${release.notes.map((note) => `<li>${note}</li>`).join('')}
        </ul>
    `,

    releaseNotification: (version: string): string => `
        Welcome to ${version}!
        <button class="text-button" onclick="showReleaseNotes(); hideReleaseNotification()">View release notes?</button>
        (or <button class="text-button" onclick="hideReleaseNotification()">ignore</button>)
    `
};

function prettify(value: string): string {
    if (value === '<computed>')
    {
        return `<em>&lt;computed&gt;</em>`;
    }
    else if (value.startsWith('${') && value.endsWith('}'))
    {
        return `<em>${value}</em>`;
    }
    else if (value.indexOf('\\n') >= 0 || value.indexOf('\\"') >= 0) {
        var sanitisedValue = value.replace(new RegExp('\\\\n', 'g'), '\n')
                                  .replace(new RegExp('\\\\"', 'g'), '"');
        
        return `<pre>${prettifyJson(sanitisedValue)}</pre>`;
    }
    else {
        return value;
    }
}

function prettifyJson(maybeJson: string): string {
    try {
        return JSON.stringify(JSON.parse(maybeJson), null, 2);
    }
    catch (e) {
        return maybeJson;
    }
}