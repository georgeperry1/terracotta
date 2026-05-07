import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the app title and tagline', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /terracotta/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/private movie rating library/i),
    ).toBeInTheDocument();
  });
});
