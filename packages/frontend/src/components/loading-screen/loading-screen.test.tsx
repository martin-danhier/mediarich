import React from 'react';
import { render } from '@testing-library/react';
import LoadingScreen from '.';

test('LoadingScreen renders ok', () => {
    const result = render(<LoadingScreen />);
    // Should display the text
    expect(result.getByText('Chargement ...')).toBeInTheDocument();
    expect(result.getByText('Chargement ...').parentElement).toHaveClass('centerContent');
});

test('LoadingScreen with error ok', () => {
    const result = render(<LoadingScreen errorMessage="Erreur !" />);
    // Should display an error
    expect(result.getByText('Erreur !')).toBeInTheDocument();
    expect(result.getByText('Erreur !').parentElement).toHaveClass('MuiAlert-root');
    expect(result.getByText('Chargement ...')).toBeInTheDocument();
});