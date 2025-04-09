import React, { useState, useEffect, useRef } from 'react';
import { Box, Tooltip, IconButton, CircularProgress } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import RefreshIcon from '@mui/icons-material/Refresh';
import { checkSupabaseConnection, reconnectSupabase } from '../utils/supabaseClient';

const ConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [isRecovering, setIsRecovering] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const statusTimeoutRef = useRef(null);

  // Show status indicator when connection is not 'connected'
  useEffect(() => {
    // Clear any existing timeout when component unmounts or dependencies change
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  // Listen for connection events from supabaseClient
  useEffect(() => {
    const handleReconnected = () => {
      console.log('[Connection] Supabase reconnected');
      setConnectionStatus('connected');
      
      // Hide the indicator after 5 seconds
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      statusTimeoutRef.current = setTimeout(() => {
        setShowStatus(false);
      }, 5000);
    };
    
    const handleOffline = () => {
      console.log('[Connection] Supabase offline');
      setConnectionStatus('disconnected');
      setShowStatus(true);
      
      // Clear any existing timeout
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
        statusTimeoutRef.current = null;
      }
    };
    
    const handleChannelError = () => {
      console.log('[Connection] Supabase channel error');
      setConnectionStatus('error');
      setShowStatus(true);
      
      // Clear any existing timeout
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
        statusTimeoutRef.current = null;
      }
    };
    
    // Add event listeners
    window.addEventListener('supabase-reconnected', handleReconnected);
    window.addEventListener('supabase-offline', handleOffline);
    window.addEventListener('supabase-channel-error', handleChannelError);
    window.addEventListener('supabase-channel-ready', handleReconnected);
    
    // Check connection on mount
    const checkConnection = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        setShowStatus(!isConnected);
      } catch (error) {
        console.error('[Connection] Error checking connection:', error);
        setConnectionStatus('error');
        setShowStatus(true);
      }
    };
    
    checkConnection();
    
    // Set up periodic connection check (every 30 seconds)
    const connectionCheckInterval = setInterval(async () => {
      if (document.visibilityState === 'visible' && connectionStatus !== 'reconnecting') {
        try {
          const isConnected = await checkSupabaseConnection();
          if (!isConnected && connectionStatus === 'connected') {
            setConnectionStatus('disconnected');
            setShowStatus(true);
          } else if (isConnected && connectionStatus !== 'connected') {
            setConnectionStatus('connected');
            
            // Hide the indicator after 5 seconds
            if (statusTimeoutRef.current) {
              clearTimeout(statusTimeoutRef.current);
            }
            statusTimeoutRef.current = setTimeout(() => {
              setShowStatus(false);
            }, 5000);
          }
        } catch (error) {
          console.error('[Connection] Error in periodic connection check:', error);
        }
      }
    }, 30000);
    
    return () => {
      // Remove event listeners
      window.removeEventListener('supabase-reconnected', handleReconnected);
      window.removeEventListener('supabase-offline', handleOffline);
      window.removeEventListener('supabase-channel-error', handleChannelError);
      window.removeEventListener('supabase-channel-ready', handleReconnected);
      
      // Clear interval
      clearInterval(connectionCheckInterval);
      
      // Clear timeout
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, [connectionStatus]);

  const handleManualReconnect = async () => {
    if (isRecovering) return;
    
    setIsRecovering(true);
    setConnectionStatus('reconnecting');
    
    try {
      const success = await reconnectSupabase(true); // Force reconnect
      setConnectionStatus(success ? 'connected' : 'error');
      
      if (success) {
        // Hide the indicator after 5 seconds
        if (statusTimeoutRef.current) {
          clearTimeout(statusTimeoutRef.current);
        }
        statusTimeoutRef.current = setTimeout(() => {
          setShowStatus(false);
        }, 5000);
      }
    } catch (error) {
      console.error('[Connection] Error during manual reconnect:', error);
      setConnectionStatus('error');
    } finally {
      setIsRecovering(false);
    }
  };

  if (!showStatus) return null;

  let icon = <WifiIcon style={{ color: '#4caf50' }} />;
  let tooltipText = 'Connected';
  
  if (connectionStatus === 'disconnected') {
    icon = <WifiOffIcon style={{ color: '#f44336' }} />;
    tooltipText = 'Disconnected. Click to reconnect.';
  } else if (connectionStatus === 'error') {
    icon = <SyncProblemIcon style={{ color: '#ff9800' }} />;
    tooltipText = 'Connection error. Click to reconnect.';
  } else if (connectionStatus === 'reconnecting') {
    icon = <CircularProgress size={24} />;
    tooltipText = 'Reconnecting...';
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '20px',
        padding: '4px 8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Tooltip title={tooltipText}>
        <IconButton 
          size="small" 
          onClick={handleManualReconnect}
          disabled={isRecovering || connectionStatus === 'connected'}
        >
          {icon}
        </IconButton>
      </Tooltip>
      
      {(connectionStatus !== 'connected' || isRecovering) && (
        <Tooltip title="Force reconnect">
          <IconButton 
            size="small" 
            onClick={handleManualReconnect}
            disabled={isRecovering}
            sx={{ ml: 1 }}
          >
            {isRecovering ? (
              <CircularProgress size={20} />
            ) : (
              <RefreshIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ConnectionStatus; 