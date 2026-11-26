// Logika koreksi dan progres (tanpa tampilan, supaya bisa diuji).
(function (root) {
  const PASS = 85;
  const CONTRACTIONS = {
    "i'm": "i am", "you're": "you are", "it's": "it is", "that's": "that is",
    "what's": "what is", "where's": "where is", "i've": "i have", "i'll": "i will",
    "don't": "do not", "doesn't": "does not", "can't": "can not", "cannot": "can not",
    "i'd": "i would", "we're": "we are", "they're": "they are", "didn't": "did not",
    "won't": "will not", "isn't": "is not", "wanna": "want to", "gonna": "going to"
  };
  const NUMBERS = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve"];

  function normalize(word) {
    let w = word.toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9' ]/g, "");
    if (/^\d+$/.test(w) && NUMBERS[+w]) w = NUMBERS[+w];
    return (CONTRACTIONS[w] || w).replace(/'/g, "").split(" ").filter(Boolean);
  }

  const tokens = (text) => text.replace(/-/g, " ").replace(/\b(\d+):00\b/g, "$1").split(/\s+/).flatMap(normalize);

  // Cocokkan urutan kata (longest common subsequence).
  function compare(target, spoken) {
    const shown = target.split(/\s+/);
    const parts = [];
    shown.forEach((w, i) => normalize(w).forEach((t) => parts.push({ t, i })));
    const said = tokens(spoken);
    const n = parts.length, m = said.length;
    const L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--)
      for (let j = m - 1; j >= 0; j--)
        L[i][j] = parts[i].t === said[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const hit = new Array(n).fill(false);
    let i = 0, j = 0, matched = 0;
    while (i < n && j < m) {
      if (parts[i].t === said[j]) { hit[i] = true; matched++; i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) i++;
      else j++;
    }
    // Kata tambahan ikut mengurangi nilai.
    const score = n ? Math.round((matched / Math.max(n, m)) * 100) : 0;
    const words = shown.map((word, k) => ({
      word, ok: parts.every((p, x) => p.i !== k || hit[x])
    }));
    return { score, words, passed: score >= PASS };
  }

  function dayKey(date) {
    const p = (x) => String(x).padStart(2, "0");
    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
  }

  // done: { indeksKalimat: "YYYY-MM-DD" saat pertama dikuasai }
  function todayIndex(done, today, total) {
    const mine = Object.keys(done).find((k) => done[k] === today);
    if (mine !== undefined) return +mine;
    for (let i = 0; i < total; i++) if (!done[i]) return i;
    return total - 1;
  }

  function streak(done, now) {
    const days = new Set(Object.values(done));
    const d = new Date(now);
    if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1); // hari ini belum selesai
    let count = 0;
    while (days.has(dayKey(d))) { count++; d.setDate(d.getDate() - 1); }
    return count;
  }

  const api = { PASS, compare, dayKey, todayIndex, streak };
  if (typeof module !== "undefined") module.exports = api;
  else root.Logic = api;
})(this);
