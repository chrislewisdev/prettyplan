const parse = require('../js/parse.js');

test('parse warnings - single warning', function() {
    const warnings = parse.parseWarnings('Warning: resource_name: <warning detail>');

    expect(warnings).toHaveLength(1);
    expect(warnings[0].id.name).toBe('resource_name:');
    expect(warnings[0].detail).toBe(' <warning detail>');
});

test('parse warnings - multiple warning', function() {
    const warnings = parse.parseWarnings('Warning: r1: w1\nWarning: r2: w2\nWarning: r3: w3');

    expect(warnings).toHaveLength(3);

    expect(warnings[0].id.name).toBe('r1:');
    expect(warnings[0].detail).toBe(' w1');

    expect(warnings[1].id.name).toBe('r2:');
    expect(warnings[1].detail).toBe(' w2');

    expect(warnings[2].id.name).toBe('r3:');
    expect(warnings[2].detail).toBe(' w3');
});

test('parse warnings - no warnings', function() {
    const warnings = parse.parseWarnings('Here are some things that are NOT warnings');

    expect(warnings).toHaveLength(0);
});