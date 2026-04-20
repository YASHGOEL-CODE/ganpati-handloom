import { useCallback } from 'react';
import { interactionsAPI } from '../services/api';

export const useInteractionTracking = () => {
  const trackInteraction = useCallback(async (productId, interactionType, metadata = {}) => {
    try {
      // Get or create session ID for guest users
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('sessionId', sessionId);
      }

      await interactionsAPI.track({
        productId,
        interactionType,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, []);

  return { trackInteraction };
};