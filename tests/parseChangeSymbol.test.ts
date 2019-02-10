import { parseChangeSymbol } from '../src/ts/parse';

test('parse change symbol', function() {
    expect(parseChangeSymbol('+')).toBe('create');
    expect(parseChangeSymbol('-')).toBe('destroy');
    expect(parseChangeSymbol('~')).toBe('update');
    expect(parseChangeSymbol('<=')).toBe('read');
    expect(parseChangeSymbol('-/+')).toBe('recreate');
    expect(parseChangeSymbol('gibberish')).toBe('unknown');
});