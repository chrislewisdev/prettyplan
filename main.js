//^ *([~+-]|-\/\+) .*$
//^(Warning:) (.*)$
//([~+-]|-\/\+) .*?(?=^ {0,2}[~+-]|-\/\+|Plan)
//([~+-]|-\/\+) .*?^ {0,2}(?=[~+-]|-\/\+|Plan)
//^\s*(.*):\s*"(.*)" => (.*)$

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
    output(plan);
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
    //TODO: Fix thee '-/' in '-/+' getting chopped off
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

function output(plan)
{
    if (plan.warnings)
    {
        var warningList = document.getElementById('warnings');
        for (var i = 0; i < plan.warnings.length; i++)
        {
            var badge = document.createElement('span');
            badge.className = 'badge';
            badge.innerText = 'warning';

            var id = document.createElement('span');
            id.className = 'id';
            id.innerText = plan.warnings[i].id;

            var detail = document.createElement('span');
            detail.innerText = plan.warnings[i].detail;
            
            var listElement = document.createElement('li');
            listElement.appendChild(badge);
            listElement.appendChild(id);
            listElement.appendChild(detail);
            warningList.appendChild(listElement);
        }
    }

    if (plan.actions)
    {
        var actionList = document.getElementById('actions');
        for (var i = 0; i < plan.actions.length; i++)
        {
            var badge = document.createElement('span');
            badge.className = 'badge';
            badge.innerText = plan.actions[i].type;

            var id = document.createElement('span');
            id.className = 'id';
            id.innerText = plan.actions[i].id;

            var changeCount = document.createElement('span');
            changeCount.className = 'change-count';
            if (plan.actions[i].changes && plan.actions[i].changes.length > 0)
            {
                changeCount.innerText = ' ' + plan.actions[i].changes.length + ' change';
                if (plan.actions[i].changes.length != 1) changeCount.innerText += 's';
            }

            var summary = document.createElement('div');
            summary.className = 'summary';
            summary.onclick = handleSummaryToggle(summary);
            summary.appendChild(badge);
            summary.appendChild(id);
            summary.appendChild(changeCount);

            var changesTable = document.createElement('table');
            for (var c = 0; c < plan.actions[i].changes.length; c++)
            {
                var property = document.createElement('td');
                property.className = 'property';
                property.innerText = plan.actions[i].changes[c].property;

                if (plan.actions[i].changes[c].old)
                {
                    var oldValue = document.createElement('td');
                    oldValue.className = 'old-value';
                    if (plan.actions[i].changes[c].old.indexOf('\\n') >= 0 || plan.actions[i].changes[c].old.indexOf('\\"') >= 0)
                    {
                        var pre = document.createElement('pre');
                        pre.innerHTML = plan.actions[i].changes[c].old;
                        pre.innerHTML = pre.innerHTML.replace(new RegExp('\\\\n', 'g'), '\n');
                        pre.innerHTML = pre.innerHTML.replace(new RegExp('\\\\"', 'g'), '"');
                        oldValue.appendChild(pre);
                    }
                    else
                    {
                        oldValue.innerHTML = plan.actions[i].changes[c].old;
                    }
                }

                var newValue = document.createElement('td');
                newValue.className = 'new-value';
                if (plan.actions[i].changes[c].new.indexOf('\\n') >= 0 || plan.actions[i].changes[c].new.indexOf('\\"') >= 0)
                {
                    var pre = document.createElement('pre');
                    pre.innerHTML = plan.actions[i].changes[c].new;
                    pre.innerHTML = pre.innerHTML.replace(new RegExp('\\\\n', 'g'), '\n');
                    pre.innerHTML = pre.innerHTML.replace(new RegExp('\\\\"', 'g'), '"');
                    newValue.appendChild(pre);
                }
                else
                {
                    newValue.innerText = plan.actions[i].changes[c].new;
                }

                var row = document.createElement('tr');
                row.appendChild(property);
                if (plan.actions[i].changes[c].old) row.appendChild(oldValue);
                row.appendChild(newValue);
                changesTable.appendChild(row);
            }
            
            var changes = document.createElement('div');
            changes.className = 'changes collapsed';
            changes.appendChild(changesTable);

            var listElement = document.createElement('li');
            listElement.className = plan.actions[i].type;
            listElement.appendChild(summary);
            listElement.appendChild(changes);
            actionList.appendChild(listElement);
        }
    }
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