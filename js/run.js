window.addEventListener('load', function () {
    // if (getCurrentVersion() != getLastUsedVersion()) {
        showReleaseNotification();
        updateLastUsedVersion();
    // }
});

function run() {
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