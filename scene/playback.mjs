export function readingTime(text, pace='relaxed') {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(10000, 2500 + words * 60000 / (pace === 'relaxed' ? 150 : 195));
}

// A rerender may deliver the second reply while the first is still on screen.
// Preserve the current turn and append only unseen entries in that case.
export function mergeQueue(queue, incoming, busy) {
  if (!busy) return incoming;
  const known = new Set(queue.map(line => line.id));
  return [...queue, ...incoming.filter(line => !known.has(line.id))];
}
