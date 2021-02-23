import fetchMock from 'jest-fetch-mock';
import { JSONInnerObject } from 'utils/api-client';
import MediaServerAPIHandler from './mediaserver-api-hanler';
import { as, asArray, asDate, asEnum } from '../validation';

beforeAll(() => {
    // Disable fetch mocks for this test file (hard to mock the mediaserver API)
    fetchMock.disableMocks();
    // .env file doesn't work for some reason
    // We use the gaumont test server
    process.env.REACT_APP_MEDIASERVER_API_ROOT = 'https://gaumont.test.fundp.ac.be/api/v2';
});

afterAll(() => {
    // Reenable fetch mocks after this file is completed
    fetchMock.enableMocks();
});

test('test api route Url loaded', () => {
    expect(process.env.REACT_APP_MEDIASERVER_API_ROOT).toStrictEqual('https://gaumont.test.fundp.ac.be/api/v2');
});

// Test the as function.
test('As function', () => {
    // Test with number
    let var1: number | undefined;
    // Using as with a parameter of the correct type returns that parameter
    var1 = as('number', 10);
    expect(var1).toStrictEqual(10);
    // Using as with a parameter of an invalid type returns undefined
    var1 = as('number', 'hello');
    expect(var1).toBeUndefined();

    // Test with boolean
    let var2: boolean | undefined;
    // Using as with a parameter of the correct type returns that parameter
    var2 = as('boolean', true);
    expect(var2).toStrictEqual(true);
    // Using as with a parameter of an invalid type returns undefined
    var2 = as('boolean', 10);
    expect(var2).toBeUndefined();

    // Test with boolean
    let var3: string | undefined;
    // Using as with a parameter of the correct type returns that parameter
    var3 = as('string', 'Hello');
    expect(var3).toStrictEqual('Hello');
    // Using as with a parameter of an invalid type returns undefined
    var3 = as('string', 10);
    expect(var3).toBeUndefined();

    // Test with object
    let var4: Date | undefined;
    // Using as with a parameter of the correct type returns that parameter
    const other = new Date();
    var4 = as(Date, other);
    expect(var4).toStrictEqual(other);
    // Using as with a parameter of an invalid type returns undefined
    var4 = as(Date, 10);
    expect(var4).toBeUndefined();
    // Using as with another class type
    var4 = as(Date, new Error());
    expect(var4).toBeUndefined();

});

// Test the asDate function. It should return the date if the string is valid, undefined otherwise
test('Test Date format', () => {
    const date = asDate('2020-11-23 17:27:00'); // Format used by mediaserver
    expect(date).toBeDefined();
    expect(date?.getDate()).toStrictEqual(23);
    expect(date?.getMonth()).toStrictEqual(10);
    expect(date?.getFullYear()).toStrictEqual(2020);
    expect(date?.getHours()).toStrictEqual(17);
    expect(date?.getMinutes()).toStrictEqual(27);
    expect(date?.getSeconds()).toStrictEqual(0);
});

test('Test Date format with invalid input', () => {
    const date = asDate('Invalid string');
    expect(date).toBeUndefined();

    const date2 = asDate(45);
    expect(date2).toBeUndefined();
});

// Test the asEnum function
test('asEnum function', () => {
    // Create a test enum
    enum TestEnum {
        FirstValue = 'first',
        SecondValue = 'second'
    }
    // Simulate a json with data
    const json: JSONInnerObject = { key: 'first', other: 'invalid', otherType: [5, 2] };

    // The existing value should be returned as is by the function and casted to the enum type
    let a: TestEnum | undefined = asEnum(TestEnum, json.key);
    expect(a).toStrictEqual(TestEnum.FirstValue);

    // The non existing value should return undefined
    a = asEnum(TestEnum, json.other);
    expect(a).toBeUndefined();

    // The wrong type should also return undefined
    a = asEnum(TestEnum, json.otherType);
    expect(a).toBeUndefined();

});

test('asArray function', () => {
    // Test with number
    let var1: number[] | undefined;
    // Correct parameter
    var1 = asArray('number', [10]);
    expect(var1).toStrictEqual([10]);
    // Not an array
    var1 = asArray('number', 'hello');
    expect(var1).toBeUndefined();
    // Not an array of the correct type
    var1 = asArray('number', ['hello']);
    expect(var1).toBeUndefined();

    // Test with boolean
    let var2: boolean[] | undefined;
    // Correct parameter
    var2 = asArray('boolean', [true]);
    expect(var2).toStrictEqual([true]);
    // Not an array
    var2 = asArray('boolean', 'hello');
    expect(var2).toBeUndefined();
    // Not an array of the correct type
    var2 = asArray('boolean', ['hello']);
    expect(var2).toBeUndefined();

    // Test with string
    let var3: string[] | undefined;
    // Correct parameter
    var3 = asArray('string', ['hello']);
    expect(var3).toStrictEqual(['hello']);
    // Not an array
    var3 = asArray('string', 42);
    expect(var3).toBeUndefined();
    // Not an array of the correct type
    var3 = asArray('string', [42]);
    expect(var3).toBeUndefined();


    // Test with object
    let var4: Date[] | undefined;
    // Using as with a parameter of the correct type returns that parameter
    const other = new Date();
    var4 = asArray(Date, [other]);
    expect(var4).toStrictEqual([other]);
    // Not an array
    var4 = asArray(Date, 10);
    expect(var4).toBeUndefined();
    // Using as with a parameter of an invalid type returns undefined
    var4 = asArray(Date, [10]);
    expect(var4).toBeUndefined();
    // Using as with another class type
    var4 = asArray(Date, [new Error()]);
    expect(var4).toBeUndefined();
});

// test('Ping', async () => {

//     const version = await MediaServer.ping();
//     expect(version).toBe('0.1.1');

// });
