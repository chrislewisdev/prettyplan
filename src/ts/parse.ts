export interface ResourceId {
    name: string;
    type: string;
    prefixes: string[];
}
export interface Warning {
    id: ResourceId;
    detail: string;
}
export enum ActionType {
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Destroy = 'destroy',
    Recreate = 'recreate',
    Unknown = 'unknown'
}
export interface Diff {
    property: string;
    new: string;
    old?: string;
    forcesNewResource?: string;
}
export interface Action {
    id: ResourceId;
    type: ActionType;
    diffs: Diff[];
}
export interface Plan {
    warnings: Warning[];
    actions: Action[];    
}

export function parse(terraformPlan: string): Plan {
    var warnings = parseWarnings(terraformPlan);

    var changeSummary = extractPlanSummary(terraformPlan);
    var actions = extractIndividualActions(changeSummary);

    var plan = { warnings: warnings, actions: [] };
    for (var i = 0; i < actions.length; i++) {
        plan.actions.push(parseAction(actions[i]));
    }

    return plan;
}

export function parseWarnings(terraformPlan: string): Warning[] {
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

export function extractPlanSummary(terraformPlan: string): string {
    var beginActionRegex = new RegExp('Terraform will perform the following actions:', 'gm');
    var begin = beginActionRegex.exec(terraformPlan);

    if (begin) return terraformPlan.substring(begin.index + 45);
    else return terraformPlan;
}

export function extractIndividualActions(changeSummary: string): string[] {
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

export function parseAction(change: string): Action {
    var actionTypeAndIdRegex = new RegExp('([~+-]|-\/\+|<=) (.*)$', 'gm');
    var actionTypeAndId = actionTypeAndIdRegex.exec(change);
    var actionTypeSymbol = actionTypeAndId[1];
    var resourceId = actionTypeAndId[2];

    var type;
    type = parseActionType(actionTypeSymbol);

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
        diffs: diffs
    };
}

export function parseId(resourceId: string): ResourceId {
    var idSegments = resourceId.split('.');
    var resourceName = idSegments[idSegments.length - 1];
    var resourceType = idSegments[idSegments.length - 2] || null;
    var resourcePrefixes = idSegments.slice(0, idSegments.length - 2);

    return { name: resourceName, type: resourceType, prefixes: resourcePrefixes };
}

export function parseActionType(changeTypeSymbol): ActionType {
    if (changeTypeSymbol === "-")
        return ActionType.Destroy;
    else if (changeTypeSymbol === "+")
        return ActionType.Create;
    else if (changeTypeSymbol === "~")
        return ActionType.Update
    else if (changeTypeSymbol === "<=")
        return ActionType.Read;
    else if (changeTypeSymbol === "-/+")
        return ActionType.Recreate;
    else
        return ActionType.Unknown;
}

export function parseSingleValueDiffs(change): Diff[] {
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

export function parseNewAndOldValueDiffs(change): Diff[] {
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