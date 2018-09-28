const parse = require('../js/parse.js');

test('extract change summary - single line', function() {
    const extractedSummary = parse.extractChangeSummary('Terraform will perform the following actions:<summary>');

    expect(extractedSummary).toBe('<summary>');
});

test('extract change summary - multi line', function() {
    const extractedSummary = parse.extractChangeSummary(`
        Text preceding the terraform plan

        Terraform will perform the following actions:

        <summary>`
    );

    expect(extractedSummary).toBe('\n\n        <summary>');
});

test('extract change summary - without any Terraform summary prefix', function() {
    const extractedSummary = parse.extractChangeSummary('<summary>');

    expect(extractedSummary).toBe('<summary>');
});