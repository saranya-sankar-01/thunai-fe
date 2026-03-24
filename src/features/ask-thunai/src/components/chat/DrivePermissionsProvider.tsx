// DrivePermissionsProvider.jsx
import { useState, useEffect, createContext, useContext } from 'react';
import { checkGoogleDrivePermissions } from '../../services/addToDrive';

// Create a context for Drive permissions
const DrivePermissionsContext = createContext({
  driveEnabled: false,
  driveConnections: [],
  isDriveLoading: true,
});

// Create a provider component
export const DrivePermissionsProvider = ({ children }) => {
  const [driveEnabled, setDriveEnabled] = useState(false);
  const [driveConnections, setDriveConnections] = useState([]);
  const [isDriveLoading, setIsDriveLoading] = useState(true);

  useEffect(() => {
    const checkDrivePermissions = async () => {
      try {
        const result = await checkGoogleDrivePermissions();
        setDriveEnabled(result.enabled);
        setDriveConnections(result.connections);
      } catch (error) {
        console.error("Failed to check Google Drive permissions:", error);
      } finally {
        setIsDriveLoading(false);
      }
    };
    
    checkDrivePermissions();
  }, []);

  return (
    <DrivePermissionsContext.Provider 
      value={{ 
        driveEnabled, 
        driveConnections, 
        isDriveLoading 
      }}
    >
      {children}
    </DrivePermissionsContext.Provider>
  );
};

// Create a custom hook to use the context
export const useDrivePermissions = () => useContext(DrivePermissionsContext);
