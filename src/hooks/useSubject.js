/**
 * useSubject — fetches a subject with its chapter list from the API.
 * Usage: const { subject, chapters, loading, error } = useSubject('biology-mcqs');
 */
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function useSubject(slug) {
  const [subject,  setSubject]  = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api.get(`/api/subjects/${slug}`)
      .then(data => {
        if (cancelled) return;
        setSubject(data);
        setChapters(data.chapters || []);
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  return { subject, chapters, loading, error };
}

/**
 * useChapterLessons — lazy-fetches lessons for a chapter when chapterId is set.
 * Usage: const { grouped, loading } = useChapterLessons(isOpen ? chapter.id : null);
 */
export function useChapterLessons(chapterId) {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!chapterId || fetched) return;

    let cancelled = false;
    setLoading(true);

    api.get(`/api/subjects/chapters/${chapterId}/lessons`)
      .then(data => {
        if (cancelled) return;
        setGrouped(data.grouped || {});
        setFetched(true);
      })
      .catch(() => { if (!cancelled) setFetched(true); }) // silent — fall back to empty
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [chapterId, fetched]);

  return { grouped, loading };
}
