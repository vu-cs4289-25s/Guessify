import React from 'react';

class FirebaseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Firebase Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          fontFamily: 'Arial, sans-serif' 
        }}>
          <h2>Something went wrong</h2>
          <p>We're having trouble connecting to our services. Please try:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>Refreshing the page</li>
            <li>Clearing your browser cache</li>
            <li>Checking your internet connection</li>
          </ul>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#1DB954',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FirebaseErrorBoundary; 