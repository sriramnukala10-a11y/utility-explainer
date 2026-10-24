'use client';

import { useEffect } from 'react';

/**
 * Validates and sanitizes UTM parameter values
 */
function sanitizeUtmValue(val: string | null): string | null {
  if (!val) return null;
  // Truncate and strip any script or dangerous characters
  return val.replace(/[^a-zA-Z0-9_\-\.]/g, '').slice(0, 100);
}

export function UtmTracker() {
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = sanitizeUtmValue(urlParams.get('utm_source'));
      const utmMedium = sanitizeUtmValue(urlParams.get('utm_medium'));
      const utmCampaign = sanitizeUtmValue(urlParams.get('utm_campaign'));
      const utmContent = sanitizeUtmValue(urlParams.get('utm_content'));

      if (utmSource || utmCampaign) {
        // Check cookie consent before persisting
        const savedConsent = localStorage.getItem('utility_cookie_consent');
        const hasConsent = savedConsent ? JSON.parse(savedConsent).analyticsConsent : false;

        if (hasConsent) {
          const attribution = {
            source: utmSource,
            medium: utmMedium,
            campaign: utmCampaign,
            content: utmContent,
            capturedAt: new Date().toISOString(),
          };
          sessionStorage.setItem('utility_utm_attribution', JSON.stringify(attribution));
        }
      }
    } catch (e) {
      // Non-blocking fail-safe
    }
  }, []);

  return null;
}
