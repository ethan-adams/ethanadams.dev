<script lang="ts">
  type Rating = 'correct' | 'hard' | 'wrong';
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

  const storageKey = 'mandarin-practice-demo-state-v1';
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
  ];

  let reviewState = $state<Record<string, CardState>>({});
  let mode = $state<'due' | 'new' | 'all'>('due');
  let currentIndex = $state(0);
  let showAnswer = $state(false);

  const defaultState = (): CardState => ({
    attempts: 0,
    correct: 0,
    misses: 0,
    streak: 0,
    intervalDays: 0,
    due: today(),
  });

  function loadState() {
    try {
      const stored = localStorage.getItem(storageKey);
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

  let selectedCards = $derived(
    cards.filter((card) => {
      const item = reviewState[card.id];
      if (mode === 'new') return !item || item.attempts === 0;
      if (mode === 'due') return due(card);
      return true;
    }),
  );

  let currentCard = $derived(selectedCards[currentIndex] ?? selectedCards[0]);
  let attempted = $derived(cards.filter((card) => (reviewState[card.id]?.attempts ?? 0) > 0).length);
  let dueCount = $derived(cards.filter(due).length);
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
    showAnswer = true;
    speakAnswer();
  }

  function speakAnswer() {
    if (!currentCard || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentCard.answerZh);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
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
  }

  $effect(() => {
    if (currentIndex >= selectedCards.length) {
      currentIndex = Math.max(selectedCards.length - 1, 0);
    }
  });

  $effect(() => {
    loadState();
  });
</script>

<section class="mandarin-shell">
  <header class="practice-header">
    <div>
      <span class="eyebrow">Local Mandarin drill</span>
      <h1>Call and response practice</h1>
    </div>
    <div class="stats" aria-label="Practice stats">
      <span>{cards.length} cards</span>
      <span>{attempted} tried</span>
      <span>{dueCount} due</span>
      <span>{accuracy === null ? 'n/a' : `${accuracy}%`} accuracy</span>
    </div>
  </header>

  <div class="practice-layout">
    <aside class="lesson-panel">
      <div class="mode-control" aria-label="Practice mode">
        <button class:active={mode === 'due'} onclick={() => ((mode = 'due'), (currentIndex = 0), (showAnswer = false))}>
          Due
        </button>
        <button class:active={mode === 'new'} onclick={() => ((mode = 'new'), (currentIndex = 0), (showAnswer = false))}>
          New
        </button>
        <button class:active={mode === 'all'} onclick={() => ((mode = 'all'), (currentIndex = 0), (showAnswer = false))}>
          All
        </button>
      </div>

      <div class="lesson-list">
        {#each selectedCards as card, index}
          <button class:active={index === currentIndex} onclick={() => ((currentIndex = index), (showAnswer = false))}>
            <span>{card.lessonId}</span>
            <strong>{card.promptEn}</strong>
          </button>
        {/each}
      </div>
    </aside>

    <article class="practice-card">
      {#if currentCard}
        <div class="card-meta">
          <span>{currentIndex + 1} / {selectedCards.length}</span>
          <span>{currentCard.generated ? 'Generated review' : currentCard.lessonId}</span>
        </div>
        <p class="prompt">{currentCard.promptEn}</p>

        {#if showAnswer}
          <div class="answer">
            <p lang="zh-CN">{currentCard.answerZh}</p>
            <span>{currentCard.pinyin}</span>
            {#if currentCard.notes}<small>{currentCard.notes}</small>{/if}
          </div>
          <div class="rating-row">
            <button class="wrong" onclick={() => rate('wrong')}>Wrong</button>
            <button class="hard" onclick={() => rate('hard')}>Hard</button>
            <button class="correct" onclick={() => rate('correct')}>Correct</button>
          </div>
        {:else}
          <button class="reveal-button" onclick={reveal}>Reveal answer</button>
        {/if}
      {:else}
        <div class="empty-state">
          <h2>No cards in this mode</h2>
          <p>Switch modes or reset the demo review state.</p>
        </div>
      {/if}
    </article>
  </div>

  <footer class="practice-footer">
    <button onclick={resetDemo}>Reset demo state</button>
    <p>This public page uses demo cards only. Real tutor PDFs, extracted text, audio, and review state stay local by design.</p>
  </footer>
</section>

<style>
  .mandarin-shell {
    min-height: 100vh;
    padding: 76px clamp(16px, 4vw, 48px) 32px;
    background: #f7f3ee;
    color: #1f2933;
  }

  .practice-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 24px;
    max-width: 1180px;
    margin: 0 auto 24px;
  }

  .eyebrow {
    display: block;
    margin-bottom: 6px;
    color: #8a4b26;
    font-size: 13px;
    font-weight: 750;
    text-transform: uppercase;
  }

  h1 {
    font-size: clamp(32px, 5vw, 56px);
    line-height: 1;
    letter-spacing: 0;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(92px, 1fr));
    gap: 8px;
    min-width: 260px;
  }

  .stats span {
    border: 1px solid #ded2c3;
    border-radius: 8px;
    background: #fffaf4;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 700;
  }

  .practice-layout {
    display: grid;
    grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
    gap: 20px;
    max-width: 1180px;
    margin: 0 auto;
  }

  .lesson-panel,
  .practice-card {
    border: 1px solid #ded2c3;
    border-radius: 8px;
    background: #fffaf4;
  }

  .lesson-panel {
    overflow: hidden;
  }

  .mode-control {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    padding: 8px;
    border-bottom: 1px solid #ded2c3;
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
    color: #5f6f7a;
    font-weight: 750;
  }

  .mode-control button.active {
    background: #2f6f73;
    color: #ffffff;
  }

  .lesson-list {
    max-height: 560px;
    overflow: auto;
    padding: 8px;
  }

  .lesson-list button {
    width: 100%;
    min-height: 82px;
    margin-bottom: 8px;
    padding: 12px;
    text-align: left;
    background: #f4ede4;
    color: #1f2933;
  }

  .lesson-list button.active {
    outline: 2px solid #2f6f73;
    background: #e8f0eb;
  }

  .lesson-list span {
    display: block;
    margin-bottom: 6px;
    color: #8a4b26;
    font-size: 12px;
    font-weight: 800;
  }

  .lesson-list strong {
    display: block;
    font-size: 14px;
    line-height: 1.35;
  }

  .practice-card {
    min-height: 520px;
    padding: clamp(24px, 5vw, 56px);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .card-meta {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
    color: #687783;
    font-size: 13px;
    font-weight: 750;
  }

  .prompt {
    max-width: 760px;
    font-size: clamp(28px, 4.4vw, 52px);
    line-height: 1.08;
    font-weight: 800;
  }

  .answer {
    margin-top: 32px;
    border-top: 1px solid #ded2c3;
    padding-top: 28px;
  }

  .answer p {
    margin-bottom: 10px;
    font-size: clamp(36px, 6vw, 72px);
    line-height: 1;
    font-weight: 850;
  }

  .answer span,
  .answer small {
    display: block;
    color: #596a74;
    font-size: 18px;
    line-height: 1.45;
  }

  .answer small {
    margin-top: 10px;
  }

  .reveal-button,
  .rating-row button {
    min-height: 48px;
    padding: 0 18px;
    font-weight: 800;
  }

  .reveal-button {
    align-self: flex-start;
    margin-top: 32px;
    background: #2f6f73;
    color: white;
  }

  .rating-row {
    display: flex;
    gap: 10px;
    margin-top: 28px;
    flex-wrap: wrap;
  }

  .rating-row button {
    min-width: 112px;
  }

  .wrong {
    background: #823329;
    color: white;
  }

  .hard {
    background: #c98c2d;
    color: #1f2933;
  }

  .correct {
    background: #2f6f73;
    color: white;
  }

  .empty-state h2 {
    margin-bottom: 8px;
    font-size: 28px;
  }

  .practice-footer {
    max-width: 1180px;
    margin: 18px auto 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    color: #687783;
    font-size: 14px;
  }

  .practice-footer button {
    min-height: 38px;
    padding: 0 12px;
    border: 1px solid #ded2c3;
    background: #fffaf4;
    color: #1f2933;
    font-weight: 750;
  }

  @media (max-width: 820px) {
    .practice-header,
    .practice-footer {
      display: block;
    }

    .stats {
      margin-top: 18px;
      width: 100%;
      min-width: 0;
    }

    .practice-layout {
      grid-template-columns: 1fr;
    }

    .lesson-list {
      max-height: 240px;
    }

    .practice-card {
      min-height: 420px;
    }

    .practice-footer p {
      margin-top: 12px;
    }
  }
</style>
