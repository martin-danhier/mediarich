import fetchMock from 'jest-fetch-mock';

beforeAll(() => {
    // .env file doesn't work for some reason
    // We use the gaumont test server
    process.env.REACT_APP_MEDIASERVER_API_ROOT = 'https://test.server.com/api/v2';
});

afterAll(() => {
    // Reenable fetch mocks after this file is completed
    fetchMock.enableMocks();
});

test('test api route Url loaded', () => {
    expect(process.env.REACT_APP_MEDIASERVER_API_ROOT).toStrictEqual('https://test.server.com/api/v2');
});


// test('Ping', async () => {

//     const version = await MediaServer.ping();
//     expect(version).toBe('0.1.1');

// });
