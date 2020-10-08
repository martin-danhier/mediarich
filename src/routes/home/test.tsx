import React from 'react';
import { render } from '@testing-library/react';
import Home from '.';

test('test 1', () => {
    const { getByText } = render(<Home name="Bonjour" />);
    expect(getByText(/Bonjour/i)).toBeInTheDocument();
});