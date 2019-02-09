export interface ResourceId {
    name: string;
    type: string;
    prefixes: string[];
}
export interface Warning {
    id: ResourceId;
    detail: string;
}
export enum ChangeType {
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Destroy = 'destroy',
    Recreate = 'recreate',
    Unknown = 'unknown'
}
export interface Diff {
    property: string;
    old: string;
    new?: string;
    forcesNewResource?: string;
}
export interface Action {
    id: ResourceId;
    type: ChangeType;
    changes: Diff[];
}
export interface Plan {
    warnings: Warning[];
    actions: Action[];    
}

export function parse(terraformPlan: string): Plan {
    var warnings = parseWarnings(terraformPlan);

    var changeSummary = extractChangeSummary(terraformPlan);
    var changes = extractIndividualChanges(changeSummary);

    var plan = { warnings: warnings, actions: [] };
    for (var i = 0; i < changes.length; i++) {
        plan.actions.push(parseChange(changes[i]));
    }

    return plan;
}

function parseWarnings(terraformPlan: string): Warning[] {
    let warningRegex: RegExp = new RegExp('Warning: (.*:)(.*)', 'gm');
    let warning: RegExpExecArray;
    let warnings: Warning[] = [];

    do {
        warning = warningRegex.exec(terraformPlan);
        if (warning) {
            warnings.push({ id: parseId(warning[1]), detail: warning[2] });
        }
    } while (warning);

    return warnings;
}

function extractChangeSummary(terraformPlan: string): string {
    var beginActionRegex = new RegExp('Terraform will perform the following actions:', 'gm');
    var begin = beginActionRegex.exec(terraformPlan);

    if (begin) return terraformPlan.substring(begin.index + 45);
    else return terraformPlan;
}

function extractIndividualChanges(changeSummary: string): string[] {
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

function parseChange(change: string): Action {
    var changeTypeAndIdRegex = new RegExp('([~+-]|-\/\+|<=) (.*)$', 'gm');
    var changeTypeAndId = changeTypeAndIdRegex.exec(change);
    var changeTypeSymbol = changeTypeAndId[1];
    var resourceId = changeTypeAndId[2];

    var type;
    type = parseChangeSymbol(changeTypeSymbol);

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

function parseId(resourceId: string): ResourceId {
    var idSegments = resourceId.split('.');
    var resourceName = idSegments[idSegments.length - 1];
    var resourceType = idSegments[idSegments.length - 2] || null;
    var resourcePrefixes = idSegments.slice(0, idSegments.length - 2);

    return { name: resourceName, type: resourceType, prefixes: resourcePrefixes };
}

function parseChangeSymbol(changeTypeSymbol): ChangeType {
    if (changeTypeSymbol === "-")
        return ChangeType.Destroy;
    else if (changeTypeSymbol === "+")
        return ChangeType.Create;
    else if (changeTypeSymbol === "~")
        return ChangeType.Update
    else if (changeTypeSymbol === "<=")
        return ChangeType.Read;
    else if (changeTypeSymbol === "-/+")
        return ChangeType.Recreate;
    else
        return ChangeType.Unknown;
}

function parseSingleValueDiffs(change): Diff[] {
    var propertyAndValueRegex = new RegExp('\\s*(.*?): *(?:<computed>|"(|[\\S\\s]*?[^\\\\])")', 'gm');
    var diff;
    var diffs = [];

    do {
        diff = propertyAndValueRegex.exec(change);
        if (diff) {
            diffs.push({
                property: diff[1].trim(),
                new: diff[2] !== undefined ? diff[2] : "<computed>"
            });
        }
    } while (diff);

    return diffs;
}

function parseNewAndOldValueDiffs(change): Diff[] {
    var propertyAndNewAndOldValueRegex = new RegExp('\\s*(.*?): *(?:"(|[\\S\\s]*?[^\\\\])")[\\S\\s]*?=> *(?:<computed>|"(|[\\S\\s]*?[^\\\\])")( \\(forces new resource\\))?', 'gm');
    var diff;
    var diffs = [];

    do {
        diff = propertyAndNewAndOldValueRegex.exec(change);
        if (diff) {
            diffs.push({
                property: diff[1].trim(),
                old: diff[2],
                new: diff[3] !== undefined ? diff[3] : "<computed>",
                forcesNewResource: diff[4] !== undefined
            });
        }
    } while (diff);

    return diffs;
}

//For usage in Jest tests
// if (module) {
//     module.exports = {
//         parseChangeSymbol: parseChangeSymbol,
//         parseId: parseId,
//         parseSingleValueDiffs: parseSingleValueDiffs,
//         parseNewAndOldValueDiffs: parseNewAndOldValueDiffs,
//         extractIndividualChanges: extractIndividualChanges,
//         extractChangeSummary: extractChangeSummary,
//         parseWarnings: parseWarnings
//     };
// }