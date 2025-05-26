import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'; // Needed because NotFoundPage uses <Link>
import NotFoundPage from '../pages/NotFoundPage';

describe('NotFoundPage', () => {
  test('renders 404 heading and message', () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    // Check for the 404 heading
    const headingElement = screen.getByRole('heading', { level: 1, name: /404/i });
    expect(headingElement).toBeInTheDocument();

    // Check for the "Page Not Found" message
    const messageElement = screen.getByText(/Oops! Page Not Found./i);
    expect(messageElement).toBeInTheDocument();

    // Check for the link to the homepage
    const linkElement = screen.getByRole('link', { name: /Go to Homepage/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/');
  });
});

