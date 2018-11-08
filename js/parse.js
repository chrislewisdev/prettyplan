function parse(terraformPlan) {
    var warnings = parseWarnings(terraformPlan);

    var changeSummary = extractChangeSummary(terraformPlan);
    var changes = extractIndividualChanges(changeSummary);

    var plan = { warnings: warnings, actions: [] };
    for (var i = 0; i < changes.length; i++) {
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
        if (warning) {
            warnings.push({ id: parseId(warning[1]), detail: warning[2] });
        }
    } while (warning);

    return warnings;
}

function extractChangeSummary(terraformPlan) {
    var beginActionRegex = new RegExp('Terraform will perform the following actions:', 'gm');
    var begin = beginActionRegex.exec(terraformPlan);

    if (begin) return terraformPlan.substring(begin.index + 45);
    else return terraformPlan;
}

function extractIndividualChanges(changeSummary) {
    //TODO: Fix the '-/' in '-/+' getting chopped off
    var changeRegex = new RegExp('([~+-]|-\/\+|<=) [\\S\\s]*?((?=-\/\+|[~+-] |<=|Plan:)|$)', 'g');
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
        id: parseId(resourceId),
        type: type,
        changes: diffs
    };
}

function parseId(resourceId) {
    var idSegments = resourceId.split('.');
    var resourceName = idSegments[idSegments.length - 1];
    var resourceType = idSegments[idSegments.length - 2] || null;
    var resourcePrefixes = idSegments.slice(0, idSegments.length - 2);

    return { name: resourceName, type: resourceType, prefixes: resourcePrefixes };
}

function parseChangeSymbol(changeTypeSymbol) {
    if (changeTypeSymbol === "-")
        return 'destroy';
    else if (changeTypeSymbol === "+")
        return 'create';
    else if (changeTypeSymbol === "~")
        return 'update';
    else if (changeTypeSymbol === "<=")
        return 'read';
    else if (changeTypeSymbol === "-/+")
        return 'recreate';
    else
        return 'unknown';
}

function parseSingleValueDiffs(change) {
    var propertyAndValueRegex = new RegExp('\\s*(.*?): *(?:<computed>|"([\\S\\s]*?[^\\\\])")', 'gm');
    var diff;
    var diffs = [];

    do {
        diff = propertyAndValueRegex.exec(change);
        if (diff) {
            diffs.push({
                property: diff[1].trim(),
                new: diff[2] ? diff[2] : "<computed>"
            });
        }
    } while (diff);

    return diffs;
}

function parseNewAndOldValueDiffs(change) {
    var propertyAndNewAndOldValueRegex = new RegExp('\\s*(.*?): *(?:"([\\S\\s]*?[^\\\\])")[\\S\\s]*?=> *(?:<computed>|"([\\S\\s]*?[^\\\\])")', 'gm');
    var diff;
    var diffs = [];

    do {
        diff = propertyAndNewAndOldValueRegex.exec(change);
        if (diff) {
            diffs.push({
                property: diff[1].trim(),
                old: diff[2],
                new: diff[3] ? diff[3] : "<computed>"
            });
        }
    } while (diff);

    return diffs;
}

//For usage in Jest tests
if (module) {
    module.exports = {
        parseChangeSymbol: parseChangeSymbol,
        parseId: parseId,
        parseSingleValueDiffs: parseSingleValueDiffs,
        parseNewAndOldValueDiffs: parseNewAndOldValueDiffs,
        extractIndividualChanges: extractIndividualChanges,
        extractChangeSummary: extractChangeSummary,
        parseWarnings: parseWarnings
    };
}