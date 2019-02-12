import { parseActionType } from '../src/ts/parse';

test('parse change symbol', function() {
    expect(parseActionType('+')).toBe('create');
    expect(parseActionType('-')).toBe('destroy');
    expect(parseActionType('~')).toBe('update');
    expect(parseActionType('<=')).toBe('read');
    expect(parseActionType('-/+')).toBe('recreate');
    expect(parseActionType('gibberish')).toBe('unknown');
});