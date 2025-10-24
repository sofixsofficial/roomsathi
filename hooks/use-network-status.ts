import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const controller = new AbortController();
        const checkTimeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(checkTimeoutId);
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };

    checkConnectivity();
    
    const intervalId = setInterval(checkConnectivity, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return { isOnline };
}
