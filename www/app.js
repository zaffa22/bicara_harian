(function () {
  const $ = (id) => document.getElementById(id);
  const S = window.SENTENCES, L = window.Logic;
  const cap = window.Capacitor;
  const native = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const KEY = "bicara-harian-v1";

  let done = {};
  try { done = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  let current; // { en, id, baca, index }  index null = kalimat sendiri

  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) { $("msg").textContent = "Progres tidak bisa disimpan."; } };

  function stats() {
    $("streak").textContent = L.streak(done, new Date());
    $("count").textContent = Object.keys(done).length;
  }

  function show(item, label) {
    current = item;
    $("label").textContent = label;
    $("en").textContent = item.en;
    $("baca").textContent = item.baca ? "Cara baca: " + item.baca : "";
    $("arti").textContent = item.id || "";
    $("result").hidden = true;
    $("msg").textContent = "";
  }

  function showToday() {
    const i = L.todayIndex(done, L.dayKey(new Date()), S.length);
    const finished = done[i] === L.dayKey(new Date());
    show({ ...S[i], index: i }, `Kalimat hari ke-${i + 1} dari ${S.length}${finished ? " · sudah dikuasai ✅" : ""}`);
  }

  function tab(name) {
    document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    ["latihan", "ulang", "sendiri"].forEach((id) => ($(id).hidden = id !== name));
    if (name === "ulang") {
      const keys = Object.keys(done);
      $("list").replaceChildren(...keys.map((k) => {
        const li = document.createElement("li"), b = document.createElement("button");
        b.textContent = S[k].en;
        b.onclick = () => { tab(null); show({ ...S[k], index: +k }, "Mengulang kalimat ke-" + (+k + 1)); };
        li.append(b);
        return li;
      }));
      if (!keys.length) $("list").textContent = "Belum ada kalimat yang dikuasai.";
    }
    if (name === null) $("latihan").hidden = false;
  }

  async function speak(text, rate) {
    $("msg").textContent = "";
    try {
      if (native) {
        await cap.Plugins.TextToSpeech.speak({ text, lang: "en-US", rate });
      } else {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "en-US"; u.rate = rate;
        speechSynthesis.speak(u);
      }
    } catch (e) {
      $("msg").textContent = "Suara contoh gagal diputar. Pasang suara bahasa Inggris di pengaturan Text-to-speech HP.";
    }
  }

  // Mengembalikan daftar kemungkinan teks yang terdengar.
  async function listen() {
    if (native) {
      const SR = cap.Plugins.SpeechRecognition;
      if (!(await SR.available()).available) throw new Error("unavailable");
      let p = await SR.checkPermissions();
      if (p.speechRecognition !== "granted") p = await SR.requestPermissions();
      if (p.speechRecognition !== "granted") throw new Error("not-allowed");
      const r = await SR.start({ language: "en-US", maxResults: 3, popup: true, prompt: current.en });
      return r.matches || [];
    }
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) throw new Error("unavailable");
    return new Promise((resolve, reject) => {
      const rec = new Rec();
      let out = [];
      rec.lang = "en-US"; rec.maxAlternatives = 3;
      rec.onresult = (e) => (out = Array.from(e.results[0], (a) => a.transcript));
      rec.onerror = (e) => reject(new Error(e.error));
      rec.onend = () => resolve(out);
      rec.start();
    });
  }

  function feedback(item, matches) {
    // Pakai kemungkinan yang paling mendekati.
    const best = matches.map((m) => ({ m, ...L.compare(item.en, m) })).sort((a, b) => b.score - a.score)[0];
    $("result").hidden = false;
    $("score").textContent = `Nilai ${best.score} ${best.passed ? "🎉" : "💪"}`;
    $("words").replaceChildren(...best.words.map((w) => {
      const b = document.createElement("button");
      b.textContent = w.word;
      b.className = w.ok ? "yes" : "no";
      b.onclick = () => speak(w.word, 0.6);
      return b;
    }));
    $("heard").textContent = `Yang terdengar: “${best.m}”`;
    const wrong = best.words.filter((w) => !w.ok).map((w) => w.word.replace(/[.,?!]+$/, ""));
    $("advice").textContent = wrong.length
      ? `Latih lagi kata: ${wrong.join(", ")}. Ketuk katanya untuk mendengar.`
      : best.passed ? "Bagus! Coba sekali lagi tanpa melihat cara bacanya." : "Ada kata tambahan. Ucapkan persis seperti kalimatnya.";
    if (best.passed && item.index !== null && !done[item.index]) {
      // Satu kalimat baru dicatat per hari; sisanya latihan bebas.
      const today = L.dayKey(new Date());
      if (!Object.values(done).includes(today)) {
        done[item.index] = today;
        save(); stats();
        $("advice").textContent += " Target hari ini tercapai!";
      }
    }
  }

  $("mic").onclick = async () => {
    const item = current;
    $("msg").textContent = "";
    $("mic").disabled = true;
    $("mic").textContent = "Mendengarkan…";
    try {
      if (native) await cap.Plugins.TextToSpeech.stop().catch(() => {});
      else window.speechSynthesis && speechSynthesis.cancel();
      const matches = await listen();
      if (item !== current) return;
      if (matches.length) feedback(item, matches);
      else $("msg").textContent = "Suara belum tertangkap. Coba lagi.";
    } catch (e) {
      const t = String(e.message || e);
      $("msg").textContent = /unavailable/i.test(t) ? "Pengenal suara tidak tersedia. Pasang atau aktifkan aplikasi Google."
        : /not-allowed|permission/i.test(t) ? "Izinkan akses mikrofon di pengaturan aplikasi."
        : /network/i.test(t) ? "Periksa koneksi internet, lalu coba lagi."
        : "Suara belum tertangkap. Coba lagi.";
    } finally {
      $("mic").disabled = false;
      $("mic").textContent = "🎤 Ucapkan";
    }
  };

  $("play").onclick = () => speak(current.en, 0.95);
  $("slow").onclick = () => speak(current.en, 0.55);
  $("useCustom").onclick = () => {
    const text = $("custom").value.trim().replace(/\s+/g, " ");
    if (!/[a-z]/i.test(text)) return $("custom").focus();
    tab(null);
    show({ en: text, index: null }, "Kalimat buatanmu");
  };
  document.querySelectorAll("nav button").forEach((b) => (b.onclick = () => {
    tab(b.dataset.tab);
    if (b.dataset.tab === "latihan") showToday();
  }));
  // Ganti hari saat aplikasi dibuka kembali.
  let shownDay = L.dayKey(new Date());
  document.addEventListener("visibilitychange", () => {
    const now = L.dayKey(new Date());
    if (!document.hidden && now !== shownDay) { shownDay = now; stats(); tab("latihan"); showToday(); }
  });

  stats();
  showToday();
})();
