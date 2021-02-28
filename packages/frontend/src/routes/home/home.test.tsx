import React from 'react';
import { render } from '@testing-library/react';
import Home from '.';

// Test test to test if tests work
// TODO remove
test('Test tests', () => {
    const { getByText } = render(<Home name="Hey" />);
    expect(getByText(/Bonjour/i)).toBeInTheDocument();
});
