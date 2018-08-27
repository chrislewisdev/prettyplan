function run()
{
    clearExistingPlan();
    
    var terraformPlan = document.getElementById("terraform-plan").value;
    var plan = parse(terraformPlan);
    console.log(plan);
    render(plan);
}