/**
 * useChapterMcqs
 * Fetches ALL mcqs for a given chapterId from the API (paginated internally).
 * Returns questions in the format the TestInterface expects:
 *   { id, text, options: [A,B,C,D], correct: 0-3, explanation }
 *
 * Usage:
 *   const { questions, loading, error, total } = useChapterMcqs(chapterId);
 *   Pass null/undefined chapterId to skip fetching.
 */
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

/** Normalize a DB mcq row → TestInterface question shape */
function normalizeRow(row) {
  const options = [row.option_a, row.option_b, row.option_c, row.option_d];
  const correctMap = { A: 0, B: 1, C: 2, D: 3 };
  const correct = correctMap[(row.correct_opt || 'A').toUpperCase()] ?? 0;

  return {
    id:          row.id,
    dbId:        row.id,
    text:        row.question_text,
    options,
    correct,
    explanation: row.explanation || '',
    imageUrl:    row.image_url   || `https://picsum.photos/400/300?random=${row.id}`,
  };
}

/** Normalize a saved_mcqs mcq_data JSON (already in TestInterface shape) */
function normalizeSaved(mcqData) {
  // mcq_data is stored as-is from the TestInterface question object
  return {
    ...mcqData,
    imageUrl: mcqData.imageUrl || `https://picsum.photos/400/300?random=${mcqData.id}`,
  };
}

export function useChapterMcqs(chapterId, lessonId) {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [total,     setTotal]     = useState(0);

  useEffect(() => {
    if (!chapterId) {
      setQuestions([]);
      setTotal(0);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setQuestions([]);

    const fetchAll = async () => {
      try {
        const PAGE = 100;
        let offset  = 0;
        let allRows = [];
        let totalCount = 0;

        // First page
        const queryBase = `/api/subjects/chapters/${chapterId}/mcqs`;
        const queryParams = `?limit=${PAGE}&offset=0${lessonId ? `&lessonId=${lessonId}` : ''}`;
        
        const first = await api.get(queryBase + queryParams);
        totalCount = first.total;
        allRows    = [...first.mcqs];
        offset    += PAGE;

        // Subsequent pages if needed
        while (allRows.length < totalCount) {
          const nextParams = `?limit=${PAGE}&offset=${offset}${lessonId ? `&lessonId=${lessonId}` : ''}`;
          const page = await api.get(queryBase + nextParams);
          allRows = [...allRows, ...page.mcqs];
          offset += PAGE;
          if (page.mcqs.length === 0) break; // safety
        }

        if (!cancelled) {
          // Fallback frontend filtering if the backend returned everything
          let filteredRows = allRows;
          console.log('[DEBUG] useChapterMcqs: lessonId from URL =', lessonId);
          console.log('[DEBUG] useChapterMcqs: Sample row lesson_id =', allRows[0]?.lesson_id);
          
          if (lessonId && lessonId !== 'undefined') {
            const targetId = parseInt(lessonId, 10);
            filteredRows = allRows.filter(row => {
              return row.lesson_id === targetId || String(row.lesson_id) === String(lessonId);
            });
            console.log('[DEBUG] useChapterMcqs: Filtered count =', filteredRows.length);
          }
          setQuestions(filteredRows.map(normalizeRow));
          setTotal(filteredRows.length);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [chapterId, lessonId]);

  return { questions, loading, error, total };
}

/**
 * useCollectionMcqs
 * Fetches saved MCQs from a named collection (e.g. "Mistakes", "Difficult Biology")
 * Returns them in the same TestInterface question shape.
 */
export function useCollectionMcqs(folderName) {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [collectionId, setCollectionId] = useState(null);

  useEffect(() => {
    if (!folderName) {
      setQuestions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchSaved = async () => {
      try {
        const encodedName = encodeURIComponent(folderName);
        const data = await api.get(`/api/collections/by-name/${encodedName}/mcqs`);
        if (!cancelled) {
          setQuestions(data.map(normalizeSaved));
        }
        // Also fetch the collection ID for bulk-delete ops
        const cols = await api.get('/api/collections');
        const col  = cols.find(c => c.name === folderName);
        if (!cancelled && col) setCollectionId(col.id);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSaved();
    return () => { cancelled = true; };
  }, [folderName]);

  return { questions, loading, error, collectionId };
}
