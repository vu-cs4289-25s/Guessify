import React, { createContext, useContext, useState } from "react";

// Create the context
const UserContext = createContext(null);

// Provide the context to your app
export const UserProvider = ({ children }) => {
  // userId and userProfile kept in memory
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  return (
    <UserContext.Provider
      value={{ userId, setUserId, userProfile, setUserProfile }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
