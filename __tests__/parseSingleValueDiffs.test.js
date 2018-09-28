const parse = require('../js/parse.js');

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