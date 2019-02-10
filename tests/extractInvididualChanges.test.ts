import { extractIndividualChanges } from '../src/ts/parse';

test('extract individual changes - with plan summary at end', function() {
    const changes = extractIndividualChanges(`
      + module.alb.aws_alb_listener.default_https
          ssl_policy:                                             "old" => "new"
    
      ~ module.api.aws_alb_listener_rule.default
          condition.2636223071.field:                             "path-pattern" => ""
          condition.2636223071.field:                             "path-pattern" => ""
          condition.2636223071.field:                             "path-pattern" => ""
    
      - module.api.aws_alb_target_group.default
          health_check.0.path:                                    "/healthcheck/old" => "/healthcheck/new"
    
      -/+ module.service_a.aws_ecs_service.default
          task_definition:                                        "service-a:185" => "service-a:179"
    
      <= module.service_b.aws_ecs_service.default
          task_definition:                                        "service-b:171" => "service-b:165"
      Plan: 2 to add, 1 to change, 2 to destroy.
    `);

    expect(changes).toHaveLength(5);
});

test('extract individual changes - without plan summary at end', function() {
    const changes = extractIndividualChanges(`
      + module.alb.aws_alb_listener.default_https
          ssl_policy:                                             "old" => "new"
    
      ~ module.api.aws_alb_listener_rule.default
          condition.2636223071.field:                             "path-pattern" => ""
    `);

    expect(changes).toHaveLength(2);
});

test('extract individual changes - with extra text at the start', function() {
    const changes = extractIndividualChanges(`
      this text here should not be detected part of the change
      neither should this
      -------------------------------------------

      + module.alb.aws_alb_listener.default_https
          ssl_policy:                                             "old" => "new"
    
      ~ module.api.aws_alb_listener_rule.default
          condition.2636223071.field:                             "path-pattern" => ""
    `);

    expect(changes).toHaveLength(2);
});