import fetchMock from 'jest-fetch-mock';
import { JSONInnerObject } from 'utils/api-client';
import { as, asDate, asEnum } from './utils';

beforeAll(() => {
    // Disable fetch mocks for this test file (hard to mock the mediaserver API)
    fetchMock.disableMocks();
    // .env file doesn't work for some reason
    process.env.REACT_APP_MEDIASERVER_API_ROOT = 'https://gaumont.test.fundp.ac.be/api/v2';
});

afterAll(() => {
    // Reenable fetch mocks after this file is completed
    fetchMock.enableMocks();
});

test('test api route Url loaded', () => {
    expect(process.env.REACT_APP_MEDIASERVER_API_ROOT).toBe('https://gaumont.test.fundp.ac.be/api/v2');
});

// Test the as function.
test('As function', () => {
    // Test with number
    let var1: number | undefined;
    // Using as with a parameter of the correct type returns that parameter
    var1 = as('number', 10);
    expect(var1).toBe(10);
    // Using as with a parameter of an invalid type returns undefined
    var1 = as('number', 'hello');
    expect(var1).toBeUndefined();

    // Test with boolean
    let var2: boolean | undefined;
    // Using as with a parameter of the correct type returns that parameter
    var2 = as('boolean', true);
    expect(var2).toBe(true);
    // Using as with a parameter of an invalid type returns undefined
    var2 = as('boolean', 10);
    expect(var2).toBeUndefined();

    // Test with boolean
    let var3: string | undefined;
    // Using as with a parameter of the correct type returns that parameter
    var3 = as('string', 'Hello');
    expect(var3).toBe('Hello');
    // Using as with a parameter of an invalid type returns undefined
    var3 = as('string', 10);
    expect(var3).toBeUndefined();

    // Test with object
    let var4: Date | undefined;
    // Using as with a parameter of the correct type returns that parameter
    const other = new Date();
    var4 = as(Date, other);
    expect(var4).toBe(other);
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
    expect(date?.getDate()).toBe(23);
    expect(date?.getMonth()).toBe(10);
    expect(date?.getFullYear()).toBe(2020);
    expect(date?.getHours()).toBe(17);
    expect(date?.getMinutes()).toBe(27);
    expect(date?.getSeconds()).toBe(0);
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
    expect(a).toBe(TestEnum.FirstValue);

    // The non existing value should return undefined
    a = asEnum(TestEnum, json.other);
    expect(a).toBeUndefined();

    // The wrong type should also return undefined
    a = asEnum(TestEnum, json.otherType);
    expect(a).toBeUndefined();

});



// test('Ping', async () => {

//     const version = await MediaServer.ping();
//     expect(version).toBe('0.1.1');

// });
