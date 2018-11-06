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
test('single value diffs - IAM policy document', function() {
    const diffs = parse.parseSingleValueDiffs(`
    policy:                                     "{\\r\\n    \\"Version\\": \\"2012-10-17\\",\\r\\n    \\"Statement\\": [\\r\\n        {\\r\\n            \\"Action\\": [\\r\\n                \\"sqs:*\\",\\r\\n                \\"sns:*\\"\\r\\n\\r\\n            ],\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n            \\"Resource\\": \\"*\\"\\r\\n        },\\r\\n        {\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n            \\"Resource\\": [\\r\\n                \\"*\\",\\r\\n                \\"*\\"\\r\\n            ],\\r\\n            \\"Action\\": [\\r\\n                \\"logs:CreateLogGroup\\",\\r\\n                \\"logs:CreateLogStream\\",\\r\\n                \\"logs:PutLogEvents\\"\\r\\n            ]\\r\\n        },\\r\\n        {\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n            \\"Resource\\": [\\r\\n                \\"*\\"\\r\\n            ],\\r\\n            \\"Action\\": [\\r\\n
        \\"s3:PutObject\\",\\r\\n                \\"s3:GetObject\\",\\r\\n                \\"s3:GetObjectVersion\\"\\r\\n            ]\\r\\n        },\\r\\n        {\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n            \\"Action\\": [\\r\\n                \\"cloudformation:*\\"\\r\\n            ],\\r\\n            \\"Resource\\": \\"*\\"\\r\\n        },\\r\\n        {\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n"
    `);

    expect(diffs).toHaveLength(1);
    expect(diffs[0].property).toBe('policy');
});