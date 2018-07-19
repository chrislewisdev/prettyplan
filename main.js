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

function parse()
{
    var terraformPlan = document.getElementById("terraform-plan").value;
    
    var warningRegex = new RegExp('Warning: (.*:)(.*)', 'gm');
    var warning;
    var warnings = [];

    do
    {
        warning = warningRegex.exec(terraformPlan);
        if (warning) warnings.push({ id: warning[1], detail: warning[2] });
    } while (warning);

    // console.log(warnings);

    var beginActionRegex = new RegExp('Terraform will perform the following actions:', 'gm');
    var begin = beginActionRegex.exec(terraformPlan);
    var actions = terraformPlan.substring(begin.index + 45);

    //TODO: fix chopping off the '-/' in '-/+' changes
    var changeRegex = new RegExp('([~+-]|-\/\+) [\\S\\s]*?\\s(?=-\/\+|[~+-]|Plan:)', 'gm');
    var change;
    var changes = [];

    // console.log(actions);
    do
    {
        change = changeRegex.exec(actions);
        // console.log(change);
        if (change) changes.push(change[0]);
    } while(change);
    
    // console.log(actions.match(new RegExp('([~+-]|-\/\+) .*?(?=^ {0,2}[~+-]|-\/\+|Plan)', 'gms')));
    // console.log(changes);

    var summary = { warnings: warnings, actions: [] };
    for (var i = 0; i < changes.length; i++)
    {
        var diffRegex = new RegExp('^ *(.*): *"(.*)" => "?(.*?)"?$', 'gm');
        var idRegex = new RegExp('([~+-]|-\/\+) (.*)$', 'gm');
        var diff;
        var diffs = [];

        do
        {
            diff = diffRegex.exec(changes[i]);
            // console.log(diff);
            if (diff) diffs.push({ property: diff[1], old: diff[2], new: diff[3] });
        } while (diff);
        
        // console.log(changes[i]);
        var id = idRegex.exec(changes[i]);
        // console.log(id);

        var type;
        if (id[1] === "-") type = 'destroy';
        else if (id[1] === "+") type = 'create';
        else if (id[1] === "~") type = 'update';

        if (id[2].match('(new resource required)'))
        {
            type = 'recreate';
            id[2] = id[2].replace(' (new resource required)', '');
        }

        summary.actions.push({ id: id[2], type: type, changes: diffs });
    }

    console.log(summary);
    output(summary);
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
            if (plan.actions[i].changes)
            {
                changeCount.innerText = ' ' + plan.actions[i].changes.length + ' change';
                if (plan.actions[i].changes.length > 1) changeCount.innerText += 's';
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

                var oldValue = document.createElement('td');
                oldValue.className = 'old-value';
                if (plan.actions[i].changes[c].old.indexOf('\\n') >= 0)
                {
                    var pre = document.createElement('pre');
                    pre.innerHTML = plan.actions[i].changes[c].old;
                    pre.innerHTML = pre.innerHTML.replace(new RegExp('\\\\n', 'g'), '\n');
                    pre.innerHTML = pre.innerHTML.replace(new RegExp('\\\\"', 'g'), '"');
                    // pre.innerHTML.replace('\"', '"');
                    oldValue.appendChild(pre);
                }
                else
                {
                    oldValue.innerHTML = plan.actions[i].changes[c].old;
                }

                var newValue = document.createElement('td');
                newValue.className = 'new-value';
                newValue.innerText = plan.actions[i].changes[c].new;

                var row = document.createElement('tr');
                row.appendChild(property);
                row.appendChild(oldValue);
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