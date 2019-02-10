import { parseId } from '../src/ts/parse'

test('parse id - no prefixes', function() {
    const id = parseId('aws_route53_record.domain_name');

    expect(id.name).toBe('domain_name');
    expect(id.type).toBe('aws_route53_record');
    expect(id.prefixes).toEqual([]);
});
test('parse id - with prefixes', function() {
    const id = parseId('module.api.aws_ecs_service.api_service');

    expect(id.name).toBe('api_service');
    expect(id.type).toBe('aws_ecs_service');
    expect(id.prefixes).toEqual(['module', 'api']);
});
test('parse id - name only', function() {
    const id = parseId('api_service');

    expect(id.name).toBe('api_service');
    expect(id.type).toBeNull();
    expect(id.prefixes).toEqual([]);
});