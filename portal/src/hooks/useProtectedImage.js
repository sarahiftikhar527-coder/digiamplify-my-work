import { useEffect, useState } from 'react';
import apiClient from '@/services/api/apiClient';

const API_PREFIX = '/api/v1';

/**
 * Profile photos are stored behind the authenticated /files route, so a plain
 * <img src="..."> can never load them (the browser does not send the login
 * token with image requests). This turns a stored photo URL into the API path
 * that can be fetched with the token. Returns '' for ordinary public URLs.
 */
export function getProtectedImageEndpoint(url) {
  if (!url || typeof url !== 'string') return '';

  const value = url.trim();

  if (!value || /^(blob:|data:)/i.test(value)) return '';

  let pathname = value;

  if (/^https?:\/\//i.test(value)) {
    try {
      pathname = new URL(value).pathname;
    } catch {
      return '';
    }
  } else {
    pathname = value.split(/[?#]/)[0];
  }

  if (pathname.startsWith(`${API_PREFIX}/files/`)) {
    return pathname.slice(API_PREFIX.length);
  }

  if (pathname.startsWith('/files/')) {
    return pathname;
  }

  const match = pathname.match(
    /\/(?:uploads|files)\/profile-documents\/([^/?#]+)$/i
  );

  if (match?.[1]) {
    return `/files/profile-documents/${match[1]}`;
  }

  return '';
}

const EMPTY = { src: '', loading: false, failed: false };

export default function useProtectedImage(url) {
  const [state, setState] = useState(EMPTY);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';

    const value = typeof url === 'string' ? url.trim() : '';

    if (!value) {
      setState(EMPTY);
      return undefined;
    }

    // Local previews (a photo just picked from the computer).
    if (/^(blob:|data:)/i.test(value)) {
      setState({ src: value, loading: false, failed: false });
      return undefined;
    }

    const endpoint = getProtectedImageEndpoint(value);

    // Ordinary public image address.
    if (!endpoint) {
      setState({ src: value, loading: false, failed: false });
      return undefined;
    }

    setState({ src: '', loading: true, failed: false });

    const load = async () => {
      try {
        const response = await apiClient.get(endpoint, {
          responseType: 'blob',
        });

        const blob = response?.data;

        if (!blob || !blob.size) {
          throw new Error('The image is empty.');
        }

        objectUrl = URL.createObjectURL(blob);

        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = '';
          return;
        }

        setState({ src: objectUrl, loading: false, failed: false });
      } catch (error) {
        if (cancelled) return;

        console.error(
          'Unable to load profile image:',
          error?.status || error?.response?.status || error?.message
        );

        setState({ src: '', loading: false, failed: true });
      }
    };

    load();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = '';
      }
    };
  }, [url]);

  return state;
}