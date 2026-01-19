import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { logs } from '../services/api';

const SESSION_ID_KEY = 'activity_session_id';

// Generate a unique session ID
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// Get or create session ID
const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

export const useActivityLogger = () => {
  const location = useLocation();
  const lastLoggedPath = useRef<string | null>(null);
  const sessionId = useRef<string>(getSessionId());

  // Log a page view
  const logPageView = useCallback(async (page: string) => {
    try {
      await logs.create({
        session_id: sessionId.current,
        action_type: 'page_view',
        page,
        details: {
          search: location.search || undefined,
          hash: location.hash || undefined,
        },
      });
    } catch (error) {
      // Silently fail - don't disrupt user experience for logging
      console.debug('Failed to log page view:', error);
    }
  }, [location.search, location.hash]);

  // Log a custom action
  const logAction = useCallback(async (actionType: string, details?: Record<string, any>) => {
    try {
      await logs.create({
        session_id: sessionId.current,
        action_type: actionType,
        page: location.pathname,
        details: details || {},
      });
    } catch (error) {
      // Silently fail
      console.debug('Failed to log action:', error);
    }
  }, [location.pathname]);

  // Auto-track page views on route changes
  useEffect(() => {
    const currentPath = location.pathname;

    // Only log if the path actually changed
    if (lastLoggedPath.current !== currentPath) {
      lastLoggedPath.current = currentPath;
      logPageView(currentPath);
    }
  }, [location.pathname, logPageView]);

  return { logAction, sessionId: sessionId.current };
};

// Component wrapper that initializes the logger within the Router context
export const ActivityLoggerWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useActivityLogger();
  return <>{children}</>;
};

export default useActivityLogger;
