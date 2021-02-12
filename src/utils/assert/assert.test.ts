import * as assert from './assert';

test('strictEqual throws exception', () => {
    // strictEqual of different values throws an AssertionError
    expect(() => assert.strictEqual(1, 2)).toThrow(assert.AssertionError);
});

test('strictEqual passes', () => {
    // strictEqual of same value should work
    assert.strictEqual(2, 2);
});

test('strictEqual with objects', () => {
    const a = {
        b: 42,
        c: 'Test',
    };
    const b = {
        b: 42,
        c: 'Test',
    };
    // Not the same objects, it doesn't have the same address
    expect(()=> assert.strictEqual(a, b)).toThrow(assert.AssertionError);
});
test('deepStrictEqual with objects', () => {
    const a = {
        b: 42,
        c: ['Test', 'Test2'],
    };
    const b = {
        b: 42,
        c: ['Test', 'Test2'],
    };

    // Not the same objects, it doesn't have the same address
    // However deepStrictEqual checks the content of the object
    // Should work
    assert.deepStrictEqual(a, b);
});

test('deepStrictEqual with different objects', () => {
    const a = {
        b: 42,
        c: ['Test', 'Test2'],
    };
    const b = {
        b: 42,
        c: ['Test', 'Test3'],
    };

    // Not the same objects, it doesn't have the same address
    // However deepStrictEqual checks the content of the object
    // Should work
    expect(() => assert.deepStrictEqual(a, b)).toThrow(assert.AssertionError);
});

test('ok with true value', () => {
    assert.ok(true); // should work
});

test('ok with false value', () => {
    expect(() => assert.ok(false)).toThrow(assert.AssertionError); // should throw assertion error
});

test('ok message', () => {
    try {
        assert.ok(false, 'my message');
    } catch (e) {
        expect(e.message).toStrictEqual('my message');
    }
});