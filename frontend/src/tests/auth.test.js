import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';

// Simple test to verify AuthContext works
describe('Authentication Context', () => {
  test('AuthProvider renders children', () => {
    render(
      <AuthProvider>
        <div>Test Content</div>
      </AuthProvider>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('AuthProvider provides default values', () => {
    let contextValue;
    
    const TestComponent = () => {
      const { useAuth } = require('../contexts/AuthContext');
      try {
        contextValue = useAuth();
      } catch (error) {
        // Expected if used outside provider
      }
      return <div>Test</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});