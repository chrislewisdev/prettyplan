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
