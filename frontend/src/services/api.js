const API_BASE = '/api/v1';

export async function fetchPapers({ page = 1, limit = 20, search = '', starredOnly = false, minScore = 0 } = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    min_score: minScore.toString(),
  });
  if (search) params.append('search', search);
  if (starredOnly) params.append('starred_only', 'true');

  const res = await fetch(`${API_BASE}/papers?${params.toString()}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchPaperByID(id) {
  const res = await fetch(`${API_BASE}/papers/${id}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function toggleStarPaper(id, isStarred) {
  const res = await fetch(`${API_BASE}/papers/${id}/star`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_starred: isStarred }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function toggleReadPaper(id, isRead) {
  const res = await fetch(`${API_BASE}/papers/${id}/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_read: isRead }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function triggerArxivFetch(keywords = '') {
  const res = await fetch(`${API_BASE}/trigger-fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchKeywords() {
  const res = await fetch(`${API_BASE}/keywords`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function updateKeywords(keywords) {
  const res = await fetch(`${API_BASE}/keywords`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
