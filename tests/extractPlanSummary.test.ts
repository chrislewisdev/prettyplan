import { extractPlanSummary } from '../src/ts/parse'

test('extract change summary - single line', function() {
    const extractedSummary = extractPlanSummary('Terraform will perform the following actions:<summary>');

    expect(extractedSummary).toBe('<summary>');
});

test('extract change summary - multi line', function() {
    const extractedSummary = extractPlanSummary(`
        Text preceding the terraform plan

        Terraform will perform the following actions:

        <summary>`
    );

    expect(extractedSummary).toBe('\n\n        <summary>');
});

test('extract change summary - without any Terraform summary prefix', function() {
    const extractedSummary = extractPlanSummary('<summary>');

    expect(extractedSummary).toBe('<summary>');
});