/**
 * @file Setup file for jest tests
 * @version 1.0
 * @author Martin Danhier
 * @license Apache
*/

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
// Configure HTTP mocks
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();