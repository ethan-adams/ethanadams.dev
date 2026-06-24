<script lang="ts">
  import { onMount } from 'svelte';

  type Rating = 'correct' | 'hard' | 'wrong';
  type Mode = 'due' | 'new' | 'all';
  type Card = {
    id: string;
    lessonId: string;
    promptEn: string;
    answerZh: string;
    pinyin: string;
    notes?: string;
    generated?: boolean;
  };
  type CardState = {
    attempts: number;
    correct: number;
    misses: number;
    streak: number;
    intervalDays: number;
    due: string;
  };
  type PinyinPart = {
    text: string;
    tone: number | null;
    syllable: boolean;
  };
  type VoiceProfile = {
    id: string;
    label: string;
    description: string;
    rate: number;
    pitch: number;
    preferredNames: string[];
  };

  const storageKey = 'mandarin-practice-demo-state-v2';
  const vowels = ['a', 'e', 'i', 'o', 'u', 'ü'];
  const toneMap: Record<string, { plain: string; tone: number }> = {
    ā: { plain: 'a', tone: 1 },
    á: { plain: 'a', tone: 2 },
    ǎ: { plain: 'a', tone: 3 },
    à: { plain: 'a', tone: 4 },
    ē: { plain: 'e', tone: 1 },
    é: { plain: 'e', tone: 2 },
    ě: { plain: 'e', tone: 3 },
    è: { plain: 'e', tone: 4 },
    ī: { plain: 'i', tone: 1 },
    í: { plain: 'i', tone: 2 },
    ǐ: { plain: 'i', tone: 3 },
    ì: { plain: 'i', tone: 4 },
    ō: { plain: 'o', tone: 1 },
    ó: { plain: 'o', tone: 2 },
    ǒ: { plain: 'o', tone: 3 },
    ò: { plain: 'o', tone: 4 },
    ū: { plain: 'u', tone: 1 },
    ú: { plain: 'u', tone: 2 },
    ǔ: { plain: 'u', tone: 3 },
    ù: { plain: 'u', tone: 4 },
    ǖ: { plain: 'ü', tone: 1 },
    ǘ: { plain: 'ü', tone: 2 },
    ǚ: { plain: 'ü', tone: 3 },
    ǜ: { plain: 'ü', tone: 4 },
  };
  const toneMarks: Record<string, string[]> = {
    a: ['ā', 'á', 'ǎ', 'à'],
    e: ['ē', 'é', 'ě', 'è'],
    i: ['ī', 'í', 'ǐ', 'ì'],
    o: ['ō', 'ó', 'ǒ', 'ò'],
    u: ['ū', 'ú', 'ǔ', 'ù'],
    ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
  };
  const voiceProfiles: VoiceProfile[] = [
    {
      id: 'adult-female',
      label: 'Adult female',
      description: 'Clear, steady',
      rate: 0.82,
      pitch: 1.02,
      preferredNames: ['Sandy', 'Tingting', 'Mei-Jia', 'Microsoft Xiaoxiao', 'Google 普通话', 'Google 中文'],
    },
    {
      id: 'adult-male',
      label: 'Adult male',
      description: 'Lower register',
      rate: 0.78,
      pitch: 0.78,
      preferredNames: ['Yunjian', 'Yunxi', 'Kangkang', 'Microsoft Yunyang', 'Microsoft Kangkang'],
    },
    {
      id: 'younger',
      label: 'Younger',
      description: 'Brighter, quicker',
      rate: 0.9,
      pitch: 1.18,
      preferredNames: ['Xiaoyi', 'Xiaoxiao', 'Microsoft Xiaoyi', 'Microsoft Xiaoxiao'],
    },
    {
      id: 'older',
      label: 'Older',
      description: 'Slower, lower',
      rate: 0.7,
      pitch: 0.72,
      preferredNames: ['Yaoyao', 'Huihui', 'Microsoft Huihui', 'Tingting'],
    },
  ];

  const today = () => new Date().toISOString().slice(0, 10);
  const addDays = (days: number) => {
    const next = new Date();
    next.setDate(next.getDate() + days);
    return next.toISOString().slice(0, 10);
  };

  const cards: Card[] = [
    {
      id: 'demo-tea',
      lessonId: 'Demo_260620',
      promptEn: 'How would you say: I want to drink tea?',
      answerZh: '我想喝茶。',
      pinyin: 'wo3 xiang3 he1 cha2.',
      notes: '想 + verb means want to do something.',
    },
    {
      id: 'demo-tomorrow',
      lessonId: 'Demo_260620',
      promptEn: 'How would you say: I want to go tomorrow?',
      answerZh: '我明天想去。',
      pinyin: 'wo3 ming2 tian1 xiang3 qu4.',
    },
    {
      id: 'demo-teacher',
      lessonId: 'Review_expanded',
      promptEn: 'How would you ask: Do you have a Chinese teacher?',
      answerZh: '你有汉语老师吗？',
      pinyin: 'ni3 you3 Han4 yu3 lao3 shi1 ma?',
      generated: true,
    },
    {
      id: 'demo-family',
      lessonId: 'Review_expanded',
      promptEn: 'How would you say: My family has four people?',
      answerZh: '我家有四口人。',
      pinyin: 'wo3 jia1 you3 si4 kou3 ren2.',
      notes: '口 is the measure word for family members.',
      generated: true,
    },
    {
      id: 'demo-age',
      lessonId: 'Review_expanded',
      promptEn: 'Mary is a young adult. Ask how old she is.',
      answerZh: 'Mary多大？',
      pinyin: 'Mary duo1 da4?',
      generated: true,
    },
    {
      id: 'demo-daughter',
      lessonId: 'Review_expanded',
      promptEn: 'How would you say: I have two daughters?',
      answerZh: '我有两个女儿。',
      pinyin: 'wo3 you3 liang3 ge nu:3 er2.',
      notes: '女儿 uses ü: nǚ ér.',
      generated: true,
    },
  ];

  let reviewState = $state<Record<string, CardState>>({});
  let mode = $state<Mode>('due');
  let currentIndex = $state(0);
  let showAnswer = $state(false);
  let showPinyin = $state(true);
  let toneColors = $state(true);
  let autoSpeak = $state(true);
  let enforceVoiceVariety = $state(true);
  let availableVoices = $state<SpeechSynthesisVoice[]>([]);
  let lastVoiceProfile = $state<VoiceProfile | null>(null);

  const defaultState = (): CardState => ({
    attempts: 0,
    correct: 0,
    misses: 0,
    streak: 0,
    intervalDays: 0,
    due: today(),
  });

  function pinyinText(value: string) {
    return value.replace(/[A-Za-züÜvV:]+[1-5]/g, (syllable) => convertNumberedSyllable(syllable));
  }

  function convertNumberedSyllable(syllable: string) {
    const tone = Number(syllable.at(-1));
    let base = syllable.slice(0, -1).replaceAll('u:', 'ü').replaceAll('U:', 'Ü').replaceAll('v', 'ü').replaceAll('V', 'Ü');
    if (tone === 5) return base;

    const lower = base.toLowerCase();
    let index = lower.indexOf('a');
    if (index < 0) index = lower.indexOf('e');
    if (index < 0) index = lower.indexOf('ou');
    if (index < 0) {
      for (let i = base.length - 1; i >= 0; i -= 1) {
        if (vowels.includes(lower[i])) {
          index = i;
          break;
        }
      }
    }
    if (index < 0) return base;

    const source = base[index];
    const marked = toneMarks[source.toLowerCase()]?.[tone - 1] ?? source;
    const finalMark = source === source.toUpperCase() ? marked.toUpperCase() : marked;
    return `${base.slice(0, index)}${finalMark}${base.slice(index + 1)}`;
  }

  function pinyinParts(value: string): PinyinPart[] {
    return pinyinText(value)
      .split(/(\s+)/)
      .filter(Boolean)
      .map((text) => {
        const tone = [...text.toLowerCase()].find((char) => toneMap[char])?.toLowerCase();
        return {
          text,
          tone: tone ? toneMap[tone].tone : null,
          syllable: /[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/i.test(text),
        };
      });
  }

  function loadState() {
    try {
      const stored = localStorage.getItem(storageKey) ?? localStorage.getItem('mandarin-practice-demo-state-v1');
      reviewState = stored ? JSON.parse(stored) : {};
    } catch {
      reviewState = {};
    }
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(reviewState));
  }

  function due(card: Card) {
    return (reviewState[card.id]?.due ?? today()) <= today();
  }

  function setMode(nextMode: Mode) {
    mode = nextMode;
    currentIndex = 0;
    showAnswer = false;
  }

  let selectedCards = $derived(
    cards.filter((card) => {
      const item = reviewState[card.id];
      if (mode === 'new') return !item || item.attempts === 0;
      if (mode === 'due') return due(card);
      return true;
    }),
  );

  let currentCard = $derived(selectedCards[currentIndex] ?? selectedCards[0]);
  let currentPinyin = $derived(currentCard ? pinyinText(currentCard.pinyin) : '');
  let currentParts = $derived(currentCard ? pinyinParts(currentCard.pinyin) : []);
  let currentState = $derived(currentCard ? { ...defaultState(), ...reviewState[currentCard.id] } : null);
  let attempted = $derived(cards.filter((card) => (reviewState[card.id]?.attempts ?? 0) > 0).length);
  let dueCount = $derived(cards.filter(due).length);
  let newCount = $derived(cards.filter((card) => (reviewState[card.id]?.attempts ?? 0) === 0).length);
  let sessionProgress = $derived(selectedCards.length ? Math.round(((currentIndex + (showAnswer ? 0.5 : 0)) / selectedCards.length) * 100) : 0);
  let accuracy = $derived.by(() => {
    const totals = cards.reduce(
      (acc, card) => {
        const item = reviewState[card.id];
        return {
          correct: acc.correct + (item?.correct ?? 0),
          attempts: acc.attempts + (item?.attempts ?? 0),
        };
      },
      { correct: 0, attempts: 0 },
    );
    return totals.attempts ? Math.round((totals.correct / totals.attempts) * 100) : null;
  });

  function reveal() {
    if (!currentCard) return;
    showAnswer = true;
    if (autoSpeak) speakAnswer();
  }

  function speakAnswer() {
    if (!currentCard || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const profile = enforceVoiceVariety
      ? voiceProfiles[currentIndex % voiceProfiles.length]
      : (lastVoiceProfile ?? voiceProfiles[0]);
    const utterance = new SpeechSynthesisUtterance(currentCard.answerZh);
    utterance.lang = 'zh-CN';
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.voice = chooseVoice(profile);
    lastVoiceProfile = profile;
    window.speechSynthesis.speak(utterance);
  }

  function chooseVoice(profile: VoiceProfile) {
    const chineseVoices = availableVoices.filter((voice) => voice.lang.toLowerCase().startsWith('zh'));
    const preferred = chineseVoices.find((voice) =>
      profile.preferredNames.some((name) => voice.name.toLowerCase().includes(name.toLowerCase())),
    );
    if (preferred) return preferred;
    if (chineseVoices.length) return chineseVoices[currentIndex % chineseVoices.length];
    return null;
  }

  function refreshVoices() {
    if (!('speechSynthesis' in window)) return;
    availableVoices = window.speechSynthesis.getVoices();
  }

  function rate(rating: Rating) {
    if (!currentCard) return;
    const item = { ...defaultState(), ...reviewState[currentCard.id] };
    item.attempts += 1;

    if (rating === 'correct') {
      item.correct += 1;
      item.streak += 1;
      item.intervalDays = item.intervalDays < 1 ? 1 : Math.min(item.intervalDays * 2, 30);
    } else if (rating === 'hard') {
      item.misses += 1;
      item.streak = 0;
      item.intervalDays = 1;
    } else {
      item.misses += 1;
      item.streak = 0;
      item.intervalDays = 0;
    }

    item.due = addDays(item.intervalDays);
    reviewState = { ...reviewState, [currentCard.id]: item };
    saveState();
    showAnswer = false;
    currentIndex = Math.min(currentIndex + 1, Math.max(selectedCards.length - 1, 0));
  }

  function resetDemo() {
    reviewState = {};
    currentIndex = 0;
    showAnswer = false;
    localStorage.removeItem(storageKey);
    localStorage.removeItem('mandarin-practice-demo-state-v1');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.target instanceof HTMLButtonElement) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!showAnswer) reveal();
    }
    if (!showAnswer) return;
    if (event.key === '1') rate('wrong');
    if (event.key === '2') rate('hard');
    if (event.key === '3') rate('correct');
  }

  $effect(() => {
    if (currentIndex >= selectedCards.length) {
      currentIndex = Math.max(selectedCards.length - 1, 0);
    }
  });

  $effect(() => {
    loadState();
  });

  onMount(() => {
    refreshVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<section class="mandarin-shell">
  <header class="practice-header">
    <div>
      <span class="eyebrow">Mandarin drill</span>
      <h1>Call and response</h1>
    </div>
    <div class="stats" aria-label="Practice stats">
      <span><strong>{dueCount}</strong> due</span>
      <span><strong>{newCount}</strong> new</span>
      <span><strong>{attempted}</strong> tried</span>
      <span><strong>{accuracy === null ? 'n/a' : `${accuracy}%`}</strong> accuracy</span>
    </div>
  </header>

  <div class="practice-layout">
    <aside class="lesson-panel" aria-label="Cards">
      <div class="mode-control" aria-label="Practice mode">
        <button class:active={mode === 'due'} onclick={() => setMode('due')}>Due</button>
        <button class:active={mode === 'new'} onclick={() => setMode('new')}>New</button>
        <button class:active={mode === 'all'} onclick={() => setMode('all')}>All</button>
      </div>

      <div class="option-row">
        <label><input type="checkbox" bind:checked={showPinyin} /> Pinyin</label>
        <label><input type="checkbox" bind:checked={toneColors} /> Tones</label>
        <label><input type="checkbox" bind:checked={autoSpeak} /> Audio</label>
      </div>

      <div class="voice-panel">
        <label><input type="checkbox" bind:checked={enforceVoiceVariety} /> Voice variety</label>
        <span>
          {#if lastVoiceProfile}
            {lastVoiceProfile.label} · {chooseVoice(lastVoiceProfile)?.name ?? 'browser fallback'}
          {:else}
            {availableVoices.filter((voice) => voice.lang.toLowerCase().startsWith('zh')).length || 'No'} Chinese voices loaded
          {/if}
        </span>
      </div>

      <div class="lesson-list">
        {#each selectedCards as card, index}
          <button
            class:active={index === currentIndex}
            class:complete={(reviewState[card.id]?.attempts ?? 0) > 0}
            onclick={() => ((currentIndex = index), (showAnswer = false))}
          >
            <span>{card.lessonId}</span>
            <strong>{card.promptEn}</strong>
            <em lang="zh-CN">{card.answerZh}</em>
          </button>
        {/each}
      </div>
    </aside>

    <article class="practice-card">
      {#if currentCard}
        <div class="progress-track" aria-label="Session progress">
          <span style={`width: ${sessionProgress}%`}></span>
        </div>

        <div class="card-meta">
          <span>{currentIndex + 1} / {selectedCards.length}</span>
          <span>{currentCard.generated ? 'Generated review' : currentCard.lessonId}</span>
          <span>{currentState?.attempts ?? 0} attempts</span>
        </div>

        <p class="prompt">{currentCard.promptEn}</p>

        {#if showAnswer}
          <div class="answer">
            <div class="answer-topline">
              <p lang="zh-CN">{currentCard.answerZh}</p>
              <button class="speak-button" onclick={speakAnswer} aria-label="Replay answer">▶</button>
            </div>
            {#if lastVoiceProfile}
              <div class="voice-chip">
                <strong>{lastVoiceProfile.label}</strong>
                <span>{lastVoiceProfile.description}</span>
              </div>
            {/if}

            {#if showPinyin}
              <div class="pinyin-line" aria-label={currentPinyin}>
                {#each currentParts as part}
                  {#if part.syllable}
                    <span class:tone-colors={toneColors} data-tone={part.tone}>{part.text}</span>
                  {:else}
                    <span>{part.text}</span>
                  {/if}
                {/each}
              </div>
            {/if}

            {#if currentCard.notes}<small>{currentCard.notes}</small>{/if}
          </div>

          <div class="rating-row">
            <button class="wrong" onclick={() => rate('wrong')}>Again</button>
            <button class="hard" onclick={() => rate('hard')}>Hard</button>
            <button class="correct" onclick={() => rate('correct')}>Correct</button>
          </div>
        {:else}
          <button class="reveal-button" onclick={reveal}>Reveal</button>
        {/if}
      {:else}
        <div class="empty-state">
          <h2>No cards</h2>
          <p>Switch modes or reset the demo state.</p>
        </div>
      {/if}
    </article>
  </div>

  <footer class="practice-footer">
    <button onclick={resetDemo}>Reset demo</button>
    <p>Demo cards run in the browser. Tutor files, extracted text, audio, and review state stay local.</p>
  </footer>
</section>

<style>
  .mandarin-shell {
    min-height: 100vh;
    padding: 76px clamp(16px, 4vw, 48px) 32px;
    background: #f6f1e8;
    color: #172126;
  }

  .practice-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 24px;
    max-width: 1180px;
    margin: 0 auto 22px;
  }

  .eyebrow {
    display: block;
    margin-bottom: 6px;
    color: #9b3f2e;
    font-size: 13px;
    font-weight: 760;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: clamp(34px, 5vw, 62px);
    line-height: 1;
    letter-spacing: 0;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(82px, 1fr));
    gap: 8px;
    min-width: min(560px, 100%);
  }

  .stats span {
    border: 1px solid #d9c8b7;
    border-radius: 8px;
    background: #fffaf2;
    padding: 10px 12px;
    color: #5a6870;
    font-size: 12px;
    font-weight: 720;
  }

  .stats strong {
    display: block;
    color: #172126;
    font-size: 20px;
    line-height: 1.1;
  }

  .practice-layout {
    display: grid;
    grid-template-columns: minmax(270px, 360px) minmax(0, 1fr);
    gap: 18px;
    max-width: 1180px;
    margin: 0 auto;
  }

  .lesson-panel,
  .practice-card {
    border: 1px solid #d9c8b7;
    border-radius: 8px;
    background: #fffaf2;
  }

  .lesson-panel {
    overflow: hidden;
  }

  .mode-control {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    padding: 8px;
    border-bottom: 1px solid #d9c8b7;
  }

  button {
    border: 0;
    border-radius: 6px;
    cursor: pointer;
    font: inherit;
  }

  .mode-control button {
    min-height: 38px;
    background: transparent;
    color: #5a6870;
    font-weight: 760;
  }

  .mode-control button.active {
    background: #245f63;
    color: #ffffff;
  }

  .option-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 10px;
    border-bottom: 1px solid #d9c8b7;
  }

  .option-row label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 34px;
    border-radius: 6px;
    background: #f2e9dd;
    color: #39484f;
    font-size: 13px;
    font-weight: 730;
  }

  .option-row input {
    accent-color: #245f63;
  }

  .voice-panel {
    display: grid;
    gap: 6px;
    padding: 10px 12px;
    border-bottom: 1px solid #d9c8b7;
    background: #fbf4ea;
  }

  .voice-panel label {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #172126;
    font-size: 13px;
    font-weight: 780;
  }

  .voice-panel input {
    accent-color: #245f63;
  }

  .voice-panel span {
    color: #5a6870;
    font-size: 12px;
    line-height: 1.3;
  }

  .lesson-list {
    max-height: 590px;
    overflow: auto;
    padding: 8px;
  }

  .lesson-list button {
    width: 100%;
    min-height: 96px;
    margin-bottom: 8px;
    padding: 12px;
    text-align: left;
    background: #f1e6d9;
    color: #172126;
  }

  .lesson-list button.active {
    outline: 2px solid #245f63;
    background: #e3eee7;
  }

  .lesson-list button.complete {
    background-image: linear-gradient(90deg, rgba(36, 95, 99, 0.12), transparent);
  }

  .lesson-list span {
    display: block;
    margin-bottom: 5px;
    color: #9b3f2e;
    font-size: 12px;
    font-weight: 800;
  }

  .lesson-list strong {
    display: block;
    font-size: 14px;
    line-height: 1.34;
  }

  .lesson-list em {
    display: block;
    margin-top: 7px;
    color: #5a6870;
    font-size: 17px;
    font-style: normal;
    font-weight: 760;
  }

  .practice-card {
    min-height: 560px;
    padding: clamp(22px, 4.5vw, 52px);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .progress-track {
    height: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: #eadccd;
    margin-bottom: 22px;
  }

  .progress-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: #245f63;
    transition: width 160ms ease;
  }

  .card-meta {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 24px;
    color: #5a6870;
    font-size: 13px;
    font-weight: 760;
  }

  .prompt {
    max-width: 780px;
    margin: 0;
    font-size: clamp(28px, 4.4vw, 54px);
    line-height: 1.08;
    font-weight: 840;
  }

  .answer {
    margin-top: 30px;
    border-top: 1px solid #d9c8b7;
    padding-top: 26px;
  }

  .answer-topline {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .answer p {
    margin: 0 0 10px;
    font-size: clamp(44px, 7vw, 86px);
    line-height: 1;
    font-weight: 850;
  }

  .speak-button {
    width: 44px;
    height: 44px;
    flex: 0 0 auto;
    background: #172126;
    color: #fffaf2;
    font-size: 15px;
  }

  .voice-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px;
    padding: 6px 9px;
    border: 1px solid #d9c8b7;
    border-radius: 6px;
    background: #f6efe5;
    color: #5a6870;
    font-size: 12px;
    font-weight: 730;
  }

  .voice-chip strong {
    color: #172126;
  }

  .pinyin-line {
    display: flex;
    flex-wrap: wrap;
    gap: 0 8px;
    color: #41525a;
    font-size: clamp(20px, 2vw, 27px);
    line-height: 1.45;
    font-weight: 760;
  }

  .pinyin-line span {
    white-space: pre;
  }

  .tone-colors[data-tone='1'] {
    color: #1f7a5c;
  }

  .tone-colors[data-tone='2'] {
    color: #256fc4;
  }

  .tone-colors[data-tone='3'] {
    color: #8a4db3;
  }

  .tone-colors[data-tone='4'] {
    color: #b43f36;
  }

  .answer small {
    display: block;
    margin-top: 12px;
    color: #5a6870;
    font-size: 16px;
    line-height: 1.45;
  }

  .reveal-button,
  .rating-row button {
    min-height: 48px;
    padding: 0 18px;
    font-weight: 820;
  }

  .reveal-button {
    align-self: flex-start;
    margin-top: 32px;
    min-width: 136px;
    background: #245f63;
    color: white;
  }

  .rating-row {
    display: flex;
    gap: 10px;
    margin-top: 28px;
    flex-wrap: wrap;
  }

  .rating-row button {
    min-width: 116px;
  }

  .wrong {
    background: #923d34;
    color: white;
  }

  .hard {
    background: #d9a441;
    color: #172126;
  }

  .correct {
    background: #245f63;
    color: white;
  }

  .empty-state h2 {
    margin: 0 0 8px;
    font-size: 28px;
  }

  .empty-state p {
    margin: 0;
    color: #5a6870;
  }

  .practice-footer {
    max-width: 1180px;
    margin: 18px auto 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    color: #5a6870;
    font-size: 14px;
  }

  .practice-footer button {
    min-height: 38px;
    padding: 0 12px;
    border: 1px solid #d9c8b7;
    background: #fffaf2;
    color: #172126;
    font-weight: 760;
  }

  .practice-footer p {
    margin: 0;
  }

  @media (max-width: 920px) {
    .practice-header,
    .practice-footer {
      display: block;
    }

    .stats {
      margin-top: 18px;
      min-width: 0;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .practice-layout {
      grid-template-columns: 1fr;
    }

    .lesson-list {
      max-height: 260px;
    }

    .practice-card {
      min-height: 430px;
    }

    .practice-footer p {
      margin-top: 12px;
    }
  }

  @media (max-width: 560px) {
    .mandarin-shell {
      padding-top: 70px;
    }

    .card-meta,
    .answer-topline,
    .rating-row {
      align-items: stretch;
    }

    .card-meta {
      flex-direction: column;
      gap: 5px;
    }

    .answer-topline {
      justify-content: space-between;
    }

    .rating-row button {
      flex: 1 1 100px;
    }
  }
</style>
