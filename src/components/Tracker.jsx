import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../utils/api';

const Tracker = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. Get or create session ID
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_session_id', sessionId);
    }

    // 2. Send tracking data
    const trackPageView = async () => {
      let eventType = 'page_view';
      let eventData = null;

      // Detect quiz attempts from URL
      if (location.pathname.includes('/practice/') && location.pathname.endsWith('/start')) {
        eventType = 'quiz_attempt';
        const pathParts = location.pathname.split('/');
        eventData = { quizId: pathParts[2] };
      }

      try {
        await api.post('/api/analytics/track', {
          sessionId,
          eventType,
          pageUrl: location.pathname,
          eventData,
        });
      } catch (error) {
        // Fail silently in UI
        console.error('Analytics tracking failed:', error);
      }
    };

    trackPageView();
  }, [location]);

  return null;
};

export default Tracker;
