const parse = require('../js/parse.js');

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