import { getCurrentVersion, getLastUsedVersion, updateLastUsedVersion } from './releases.js';
import { expandAll, collapseAll, accordion, closeModal } from './ui.js';
import { showReleaseNotification, hideReleaseNotification, showReleaseNotes, displayParsingErrorMessage, hideParsingErrorMessage, clearExistingOutput, unHidePlan, render } from './render.js';
import { parse } from './parse';

window.addEventListener('load', function () {
    if (getCurrentVersion() != getLastUsedVersion()) {
        showReleaseNotification(getCurrentVersion());
        updateLastUsedVersion();
    }
}); 

(<any>window).runPrettyplan = () => {
    hideParsingErrorMessage();
    clearExistingOutput();

    var terraformPlan = (<HTMLTextAreaElement>document.getElementById("terraform-plan")).value;
    var plan = parse(terraformPlan);

    if (plan.warnings.length === 0 && plan.actions.length === 0) {
        displayParsingErrorMessage();
    }

    render(plan);
    unHidePlan();
}

(<any>window).showReleaseNotes = showReleaseNotes;
(<any>window).expandAll = expandAll;
(<any>window).collapseAll = collapseAll;
(<any>window).accordion = accordion;
(<any>window).closeModal = closeModal;
(<any>window).hideReleaseNotification = hideReleaseNotification;