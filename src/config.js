const config = {
  // Use environment variable if available, otherwise fallback to localhost
  SOCKET_SERVER_URL: process.env.REACT_APP_SOCKET_SERVER_URL || 'http://localhost:5001'
};

export default config; 