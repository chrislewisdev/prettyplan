import { extractChangeSummary } from '../src/ts/parse'

test('extract change summary - single line', function() {
    const extractedSummary = extractChangeSummary('Terraform will perform the following actions:<summary>');

    expect(extractedSummary).toBe('<summary>');
});

test('extract change summary - multi line', function() {
    const extractedSummary = extractChangeSummary(`
        Text preceding the terraform plan

        Terraform will perform the following actions:

        <summary>`
    );

    expect(extractedSummary).toBe('\n\n        <summary>');
});

test('extract change summary - without any Terraform summary prefix', function() {
    const extractedSummary = extractChangeSummary('<summary>');

    expect(extractedSummary).toBe('<summary>');
});