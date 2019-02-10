import { parseNewAndOldValueDiffs } from '../src/ts/parse';

test('new and old value diffs - quote formatting', function() {
    const diffs = parseNewAndOldValueDiffs('property_name: "old_value" => "new_value"');

    expect(diffs).toHaveLength(1);
    expect(diffs[0].property).toBe('property_name');
    expect(diffs[0].old).toBe('old_value');
    expect(diffs[0].new).toBe('new_value');
});
test('new and old value diffs - empty quotes', function() {
    const diffs = parseNewAndOldValueDiffs('property_name: "" => "new_value"');

    expect(diffs).toHaveLength(1);
    expect(diffs[0].property).toBe('property_name');
    expect(diffs[0].old).toBe('');
    expect(diffs[0].new).toBe('new_value');
});
test('new and old value diffs - computed values', function() {
    const diffs = parseNewAndOldValueDiffs('property_name: "old_value" => <computed>');

    expect(diffs).toHaveLength(1);
    expect(diffs[0].property).toBe('property_name');
    expect(diffs[0].old).toBe('old_value');
    expect(diffs[0].new).toBe('<computed>');
});
test('new and old value diffs - whitespace handling', function() {
    const diffs = parseNewAndOldValueDiffs('   property_name   : " old_value " => "new_value "');

    expect(diffs).toHaveLength(1);
    expect(diffs[0].property).toBe('property_name');
    expect(diffs[0].old).toBe(' old_value ');
    expect(diffs[0].new).toBe('new_value ');
});
test('new and old value diffs - multi line', function() {
    const diffs = parseNewAndOldValueDiffs('property1: "old1" => "new1"\n property2: "old2" => "new2"');

    expect(diffs).toHaveLength(2);
    expect(diffs[0].property).toBe('property1');
    expect(diffs[0].old).toBe('old1');
    expect(diffs[0].new).toBe('new1');
    expect(diffs[1].property).toBe('property2');
    expect(diffs[1].old).toBe('old2');
    expect(diffs[1].new).toBe('new2');
});
test('new and old value diffs - IAM policy document', function() {
    const diffs = parseNewAndOldValueDiffs(`
    policy:                                     "{\\r\\n    \\"Version\\": \\"2012-10-17\\",\\r\\n    \\"Statement\\": [\\r\\n        {\\r\\n            \\"Action\\": [\\r\\n                \\"sqs:*\\",\\r\\n                \\"sns:*\\"\\r\\n\\r\\n            ],\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n            \\"Resource\\": \\"*\\"\\r\\n        },\\r\\n        {\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n            \\"Resource\\": [\\r\\n                \\"*\\",\\r\\n                \\"*\\"\\r\\n            ],\\r\\n            \\"Action\\": [\\r\\n                \\"logs:CreateLogGroup\\",\\r\\n                \\"logs:CreateLogStream\\",\\r\\n                \\"logs:PutLogEvents\\"\\r\\n            ]\\r\\n        },\\r\\n        {\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n            \\"Resource\\": [\\r\\n                \\"*\\"\\r\\n            ],\\r\\n            \\"Action\\": [\\r\\n
        \\"s3:PutObject\\",\\r\\n                \\"s3:GetObject\\",\\r\\n                \\"s3:GetObjectVersion\\"\\r\\n            ]\\r\\n        },\\r\\n        {\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n            \\"Action\\": [\\r\\n                \\"cloudformation:*\\"\\r\\n            ],\\r\\n            \\"Resource\\": \\"*\\"\\r\\n        },\\r\\n        {\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n"
    => "{\\r\\n    \\"Version\\": \\"2012-10-17\\",\\r\\n    \\"Statement\\": [\\r\\n        {\\r\\n            \\"Action\\": [\\r\\n                \\"sqs:*\\",\\r\\n                \\"sns:*\\"\\r\\n\\r\\n            ],\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n            \\"Resource\\": \\"*\\"\\r\\n        },\\r\\n        {\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n            \\"Resource\\": [\\r\\n                \\"*\\",\\r\\n                \\"*\\"\\r\\n            ],\\r\\n            \\"Action\\": [\\r\\n                \\"logs:CreateLogGroup\\",\\r\\n                \\"logs:CreateLogStream\\",\\r\\n                \\"logs:PutLogEvents\\"\\r\\n            ]\\r\\n        },\\r\\n        {\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n            \\"Resource\\": [\\r\\n                \\"*\\"\\r\\n            ],\\r\\n            \\"Action\\": [\\r\\n
        \\"s3:PutObject\\",\\r\\n                \\"s3:GetObject\\",\\r\\n                \\"s3:GetObjectVersion\\"\\r\\n            ]\\r\\n        },\\r\\n        {\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n            \\"Action\\": [\\r\\n                \\"cloudformation:*\\"\\r\\n            ],\\r\\n            \\"Resource\\": \\"*\\"\\r\\n        },\\r\\n        {\\r\\n            \\"Effect\\": \\"Allow\\",\\r\\n"
    `);

    expect(diffs).toHaveLength(1);
    expect(diffs[0].property).toBe('policy');
});
test('force new resource - false for normal diffs', function() {
    const diffs = parseNewAndOldValueDiffs('property_name: "old_value" => "new_value"');

    expect(diffs).toHaveLength(1);
    expect(diffs[0].forcesNewResource).toBe(false);
});
test('force new resource - true when included', function() {
    const diffs = parseNewAndOldValueDiffs('property_name: "old_value" => "new_value" (forces new resource)');

    expect(diffs).toHaveLength(1);
    expect(diffs[0].forcesNewResource).toBe(true);
});
test('force new resource - works for <computed> values', function() {
    const diffs = parseNewAndOldValueDiffs('property_name: "old_value" => <computed> (forces new resource)');

    expect(diffs).toHaveLength(1);
    expect(diffs[0].forcesNewResource).toBe(true);
});