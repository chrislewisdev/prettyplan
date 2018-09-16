const parse = require('../js/parse.js');

test('parse id - no prefixes', function() {
    const id = parse.parseId('aws_route53_record.domain_name');

    expect(id.name).toBe('domain_name');
    expect(id.type).toBe('aws_route53_record');
    expect(id.prefixes).toEqual([]);
});
test('parse id - with prefixes', function() {
    const id = parse.parseId('module.api.aws_ecs_service.api_service');

    expect(id.name).toBe('api_service');
    expect(id.type).toBe('aws_ecs_service');
    expect(id.prefixes).toEqual(['module', 'api']);
});
test('parse id - name only', function() {
    const id = parse.parseId('api_service');

    expect(id.name).toBe('api_service');
    expect(id.type).toBeNull();
    expect(id.prefixes).toEqual([]);
});

test('parse change symbol', function() {
    expect(parse.parseChangeSymbol('+')).toBe('create');
    expect(parse.parseChangeSymbol('-')).toBe('destroy');
    expect(parse.parseChangeSymbol('~')).toBe('update');
    expect(parse.parseChangeSymbol('<=')).toBe('read');
    expect(parse.parseChangeSymbol('-/+')).toBe('recreate');
    expect(parse.parseChangeSymbol('gibberish')).toBe('unknown');
});

test('single value diffs - quote formatting', function() {
    const diffs = parse.parseSingleValueDiffs('property_name: "new_value"');

    expect(diffs).toHaveLength(1);
    expect(diffs[0].property).toBe('property_name');
    expect(diffs[0].new).toBe('new_value');
});
test('single value diffs - computed values', function() {
    const diffs = parse.parseSingleValueDiffs('property_name: <computed>');

    expect(diffs).toHaveLength(1);
    expect(diffs[0].property).toBe('property_name');
    expect(diffs[0].new).toBe('<computed>');
});
test('single value diffs - whitespace handling', function() {
    const diffs = parse.parseSingleValueDiffs('     property_name :    " value "   ');

    expect(diffs).toHaveLength(1);
    expect(diffs[0].property).toBe('property_name');
    expect(diffs[0].new).toBe(' value ');
});
test('single value diffs - multi line', function() {
    const diffs = parse.parseSingleValueDiffs('property1: "value1"\n property2: "value2"');

    expect(diffs).toHaveLength(2);
    expect(diffs[0].property).toBe('property1');
    expect(diffs[0].new).toBe('value1');
    expect(diffs[1].property).toBe('property2');
    expect(diffs[1].new).toBe('value2');
});

test('new and old value diffs - quote formatting', function() {
    const diffs = parse.parseNewAndOldValueDiffs('property_name: "old_value" => "new_value"');

    expect(diffs).toHaveLength(1);
    expect(diffs[0].property).toBe('property_name');
    expect(diffs[0].old).toBe('old_value');
    expect(diffs[0].new).toBe('new_value');
});
test('new and old value diffs - computed values', function() {
    const diffs = parse.parseNewAndOldValueDiffs('property_name: "old_value" => <computed>');

    expect(diffs).toHaveLength(1);
    expect(diffs[0].property).toBe('property_name');
    expect(diffs[0].old).toBe('old_value');
    expect(diffs[0].new).toBe('<computed>');
});
test('new and old value diffs - whitespace handling', function() {
    const diffs = parse.parseNewAndOldValueDiffs('   property_name   : " old_value " => "new_value "');

    expect(diffs).toHaveLength(1);
    expect(diffs[0].property).toBe('property_name');
    expect(diffs[0].old).toBe(' old_value ');
    expect(diffs[0].new).toBe('new_value ');
});
test('new and old value diffs - multi line', function() {
    const diffs = parse.parseNewAndOldValueDiffs('property1: "old1" => "new1"\n property2: "old2" => "new2"');

    expect(diffs).toHaveLength(2);
    expect(diffs[0].property).toBe('property1');
    expect(diffs[0].old).toBe('old1');
    expect(diffs[0].new).toBe('new1');
    expect(diffs[1].property).toBe('property2');
    expect(diffs[1].old).toBe('old2');
    expect(diffs[1].new).toBe('new2');
});