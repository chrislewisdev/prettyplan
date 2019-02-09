import { getCurrentVersion, getLastUsedVersion, updateLastUsedVersion } from './releases.js';
import { expandAll, collapseAll, accordion, closeModal } from './ui.js';
import { showReleaseNotification, hideReleaseNotification, showReleaseNotes, displayParsingErrorMessage, hideParsingErrorMessage, clearExistingOutput, unHidePlan, render } from './render.js';
import { parse } from './parse.js';

window.addEventListener('load', function () {
    if (getCurrentVersion() != getLastUsedVersion()) {
        showReleaseNotification(getCurrentVersion());
        updateLastUsedVersion();
    }
}); 

window.runPrettyplan = function() {
    hideParsingErrorMessage();
    clearExistingOutput();

    var terraformPlan = document.getElementById("terraform-plan").value;
    var plan = parse(terraformPlan);

    if (plan.warnings.length === 0 && plan.actions.length === 0) {
        displayParsingErrorMessage();
    }

    render(plan);
    unHidePlan();
}

window.showReleaseNotes = showReleaseNotes;
window.expandAll = expandAll;
window.collapseAll = collapseAll;
window.accordion = accordion;
window.closeModal = closeModal;
window.hideReleaseNotification = hideReleaseNotification;