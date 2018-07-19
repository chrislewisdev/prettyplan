//^ *([~+-]|-\/\+) .*$
//^(Warning:) (.*)$
//([~+-]|-\/\+) .*?(?=^ {0,2}[~+-]|-\/\+|Plan)
//([~+-]|-\/\+) .*?^ {0,2}(?=[~+-]|-\/\+|Plan)
//^\s*(.*):\s*"(.*)" => (.*)$

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
    
    var warningRegex = new RegExp('Warning: (.*)', 'gm');
    var warning;
    var warnings = [];

    do
    {
        warning = warningRegex.exec(terraformPlan);
        if (warning) warnings.push(warning[1]);
    } while (warning);

    console.log(warnings);

    var beginActionRegex = new RegExp('Terraform will perform the following actions:', 'gm');
    var begin = beginActionRegex.exec(terraformPlan);
    var actions = terraformPlan.substring(begin.index + 45);

    //TODO: fix chopping off the '-/' in '-/+' changes
    var changeRegex = new RegExp('([~+-]|-\/\+) .*?^ {0,2}(?=-\/\+|[~+-]|Plan)', 'gms');
    var change;
    var changes = [];

    do
    {
        change = changeRegex.exec(actions);
        if (change) changes.push(change[0]);
    } while(change);
    
    // console.log(actions.match(new RegExp('([~+-]|-\/\+) .*?(?=^ {0,2}[~+-]|-\/\+|Plan)', 'gms')));
    console.log(changes);

    var summary = { warnings: warnings, actions: [] };
    for (var i = 0; i < changes.length; i++)
    {
        var diffRegex = new RegExp('^ *(.*): *"(.*)" => (.*)$', 'gm');
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

        summary.actions.push({ id: id[2], type: type, diffs: diffs });
    }

    console.log(summary);
}