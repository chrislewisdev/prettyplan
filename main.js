function handleSummaryToggle(element)
{
    return function () 
    {
        accordion(element);
    };
}

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

function run()
{
    var terraformPlan = document.getElementById("terraform-plan").value;
    var plan = parse(terraformPlan);
    console.log(plan);
    render(plan);
}

function parse(terraformPlan)
{
    var warnings = parseWarnings(terraformPlan);
    
    var changeSummary = extractChangeSummary(terraformPlan);
    var changes = extractIndividualChanges(changeSummary);
    
    var plan = { warnings: warnings, actions: [] };
    for (var i = 0; i < changes.length; i++)
    {
        plan.actions.push(parseChange(changes[i]));
    }
    
    return plan;
}

function parseWarnings(terraformPlan) {
    var warningRegex = new RegExp('Warning: (.*:)(.*)', 'gm');
    var warning;
    var warnings = [];
    
    do {
        warning = warningRegex.exec(terraformPlan);
        if (warning)
        warnings.push({ id: warning[1], detail: warning[2] });
    } while (warning);
    
    return warnings;
}

function extractChangeSummary(terraformPlan) {
    var beginActionRegex = new RegExp('Terraform will perform the following actions:', 'gm');
    var begin = beginActionRegex.exec(terraformPlan);
    
    return terraformPlan.substring(begin.index + 45);
}

function extractIndividualChanges(changeSummary) {
    //TODO: Fix the '-/' in '-/+' getting chopped off
    var changeRegex = new RegExp('([~+-]|-\/\+|<=) [\\S\\s]*?\\s(?=-\/\+|[~+-]|<=|Plan:)', 'gm');
    var change;
    var changes = [];

    do {
        change = changeRegex.exec(changeSummary);
        if (change) changes.push(change[0]);
    } while (change);

    return changes;
}

function parseChange(change) {
    var changeTypeAndIdRegex = new RegExp('([~+-]|-\/\+|<=) (.*)$', 'gm');
    var changeTypeAndId = changeTypeAndIdRegex.exec(change);
    var changeTypeSymbol = changeTypeAndId[1];
    var resourceId = changeTypeAndId[2];
    
    var type;
    type = parseChangeSymbol(changeTypeSymbol, type);

    //Workaround for recreations showing up as '+' changes
    if (resourceId.match('(new resource required)')) {
        type = 'recreate';
        resourceId = resourceId.replace(' (new resource required)', '');
    }

    var diffs;
    if (type === 'create' || type === 'read') {
        diffs = parseSingleValueDiffs(change);
    }
    else {
        diffs = parseNewAndOldValueDiffs(change);
    }
    
    return { 
        id: resourceId, 
        type: type, 
        changes: diffs 
    };
}

function parseChangeSymbol(changeTypeSymbol, type) {
    if (changeTypeSymbol === "-")
        return 'destroy';
    else if (changeTypeSymbol === "+")
        return 'create';
    else if (changeTypeSymbol === "~")
        return 'update';
    else if (changeTypeSymbol === "<=")
        return 'read';
}

function parseSingleValueDiffs(change)
{
    var propertyAndValueRegex = new RegExp('^ *(.*?): *"?(.*?)"?$', 'gm');
    var diff;
    var diffs = [];

    do {
        diff = propertyAndValueRegex.exec(change);
        if (diff) diffs.push({ property: diff[1], new: diff[2] });
    } while (diff);

    return diffs;
}

function parseNewAndOldValueDiffs(change)
{
    var propertyAndNewAndOldValueRegex = new RegExp('^ *(.*): *"(.*)" => "?(.*?)"?$', 'gm');
    var diff;
    var diffs = [];

    do {
        diff = propertyAndNewAndOldValueRegex.exec(change);
        if (diff) diffs.push({ property: diff[1], old: diff[2], new: diff[3] });
    } while (diff);

    return diffs;
}

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