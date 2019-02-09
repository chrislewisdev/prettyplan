const parse = require('../js/parse.js');

test('parse change symbol', function() {
    expect(parse.parseChangeSymbol('+')).toBe('create');
    expect(parse.parseChangeSymbol('-')).toBe('destroy');
    expect(parse.parseChangeSymbol('~')).toBe('update');
    expect(parse.parseChangeSymbol('<=')).toBe('read');
    expect(parse.parseChangeSymbol('-/+')).toBe('recreate');
    expect(parse.parseChangeSymbol('gibberish')).toBe('unknown');
});