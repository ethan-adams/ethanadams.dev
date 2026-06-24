<script lang="ts">
  import Map from './lib/components/Map.svelte';
  import ControlPanel from './lib/components/ControlPanel.svelte';
  import MandarinPractice from './lib/components/MandarinPractice.svelte';
  import { projects, featuredProject, type PortfolioProject } from './lib/data/projects';
  import { countyScores } from './lib/stores/dimensions';
  import { theme } from './lib/stores/theme';
  import { onMount } from 'svelte';

  type Tab = 'overview' | 'projects' | 'homesteader' | 'mandarin' | 'contact';

  const tabs: { id: Tab; label: string; href: string }[] = [
    { id: 'overview', label: 'Index', href: '/' },
    { id: 'projects', label: 'Work', href: '/projects' },
    { id: 'homesteader', label: 'Map', href: '/homesteader' },
    { id: 'mandarin', label: 'Drill', href: '/mandarin' },
    { id: 'contact', label: 'Contact', href: '/contact' },
  ];

  let showDebug = $state(false);
  let pathname = $state('/');
  let unlockedProjectKeys = $state<string[]>([]);
  let unlockProject = $state<PortfolioProject | null>(null);
  let passcode = $state('');
  let passcodeError = $state('');

  const activeTab = $derived(getTabFromPath(pathname));
  const activeProject = $derived(projects.find((project) => project.slug === activeTab));
  const isProjectDemo = $derived(activeTab === 'homesteader' || activeTab === 'mandarin');
  const isUnlockOpen = $derived(Boolean(unlockProject));

  function getTabFromPath(path: string): Tab {
    if (path.startsWith('/projects')) return 'projects';
    if (path.startsWith('/homesteader')) return 'homesteader';
    if (path.startsWith('/mandarin')) return 'mandarin';
    if (path.startsWith('/contact')) return 'contact';
    return 'overview';
  }

  function navigate(event: MouseEvent, href: string) {
    event.preventDefault();
    const next = new URL(href, window.location.origin);
    const current = `${window.location.pathname}${window.location.hash}`;
    const target = `${next.pathname}${next.hash}`;
    if (current === target) return;
    window.history.pushState({}, '', target);
    pathname = next.pathname;
    if (next.hash) {
      document.querySelector(next.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function isProjectUnlocked(project: PortfolioProject) {
    return !project.locked || unlockedProjectKeys.includes(project.locked.storageKey);
  }

  function getProjectTitle(project: PortfolioProject) {
    return isProjectUnlocked(project) ? project.title : (project.locked?.title ?? project.title);
  }

  function getProjectSubtitle(project: PortfolioProject) {
    return isProjectUnlocked(project) ? project.subtitle : (project.locked?.subtitle ?? project.subtitle);
  }

  function getProjectSummary(project: PortfolioProject) {
    return isProjectUnlocked(project) ? project.summary : (project.locked?.summary ?? project.summary);
  }

  function getProjectDetail(project: PortfolioProject) {
    return isProjectUnlocked(project) ? project.detail : (project.locked?.detail ?? project.detail);
  }

  function getProjectStack(project: PortfolioProject) {
    return isProjectUnlocked(project) ? project.stack : ['Private', 'Passcode'];
  }

  function getProjectMetrics(project: PortfolioProject) {
    return isProjectUnlocked(project)
      ? project.metrics
      : [
          { label: 'Access', value: 'Locked' },
          { label: 'Set', value: 'Private' },
          { label: 'Status', value: 'Hidden' },
        ];
  }

  function openUnlock(project: PortfolioProject) {
    unlockProject = project;
    passcode = '';
    passcodeError = '';
  }

  function closeUnlock() {
    unlockProject = null;
    passcode = '';
    passcodeError = '';
  }

  function handleProjectOpen(event: MouseEvent, project: PortfolioProject) {
    if (project.locked && !isProjectUnlocked(project)) {
      event.preventDefault();
      openUnlock(project);
      return;
    }

    navigate(event, project.route);
  }

  function submitPasscode() {
    if (!unlockProject?.locked) return;

    if (passcode.trim() !== unlockProject.locked.passcode) {
      passcodeError = 'Passcode did not match.';
      return;
    }

    const storageKey = unlockProject.locked.storageKey;
    unlockedProjectKeys = [...new Set([...unlockedProjectKeys, storageKey])];
    localStorage.setItem(storageKey, 'unlocked');
    const route = unlockProject.route;
    closeUnlock();
    window.history.pushState({}, '', route);
    pathname = window.location.pathname;
    if (window.location.hash) {
      requestAnimationFrame(() => {
        document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'd') {
      showDebug = !showDebug;
    }
  }

  onMount(() => {
    document.documentElement.setAttribute('data-theme', $theme);
    pathname = window.location.pathname;
    unlockedProjectKeys = projects
      .map((project) => project.locked?.storageKey)
      .filter((storageKey): storageKey is string => Boolean(storageKey && localStorage.getItem(storageKey) === 'unlocked'));
  });

  $effect(() => {
    document.documentElement.setAttribute('data-theme', $theme);
  });
</script>

<svelte:window onkeypress={handleKeyPress} onpopstate={() => (pathname = window.location.pathname)} />

<main class:demo-mode={isProjectDemo}>
  <header class="site-header">
    <a class="brand" href="/" onclick={(event) => navigate(event, '/')}>
      <span class="brand-mark">EA</span>
      <span>
        <strong>Ethan Adams</strong>
        <small>quiet tools / live systems</small>
      </span>
    </a>

    <nav class="tab-nav" aria-label="Portfolio navigation">
      {#each tabs as tab}
        <a
          class:active={activeTab === tab.id}
          href={tab.href}
          aria-current={activeTab === tab.id ? 'page' : undefined}
          onclick={(event) => navigate(event, tab.href)}
        >
          {tab.label}
        </a>
      {/each}
    </nav>

    <button class="theme-button" onclick={() => theme.toggle()} aria-label="Toggle theme">
      {$theme === 'light' ? 'Dark' : 'Light'}
    </button>
  </header>

  {#if activeTab === 'overview'}
    <section class="hero-section">
      <div class="hero-copy">
        <span class="eyebrow">ethanadams.dev</span>
        <h1>Quiet software with teeth.</h1>
        <p>
          A portfolio of live tools, local systems, and experiments: intelligence feeds, map interfaces, language drills,
          game prototypes, and small machines built for repeated use.
        </p>
        <div class="hero-actions">
          <a class="primary-link" href="/projects" onclick={(event) => navigate(event, '/projects')}>View projects</a>
          <a class="secondary-link" href="/contact" onclick={(event) => navigate(event, '/contact')}>Get in touch</a>
        </div>
      </div>

      <a
        class="featured-panel"
        href={featuredProject.route}
        style={`--project-accent: ${featuredProject.accent}`}
        onclick={(event) => handleProjectOpen(event, featuredProject)}
      >
        <span class="panel-kicker">{isProjectUnlocked(featuredProject) ? 'Current signal' : 'Private set'}</span>
        <h2>{getProjectTitle(featuredProject)}</h2>
        <p>{getProjectSummary(featuredProject)}</p>
        <div class="metric-row">
          {#each getProjectMetrics(featuredProject) as metric}
            <span>
              <strong>{metric.value}</strong>
              {metric.label}
            </span>
          {/each}
        </div>
      </a>
    </section>

    <section class="content-band">
      <div class="section-heading">
        <span class="eyebrow">Mode</span>
        <h2>Less brochure. More evidence.</h2>
      </div>
      <div class="focus-grid">
        <article>
          <h3>Live demos</h3>
          <p>The strongest projects stay operable in the page, so the interaction can speak before the case study does.</p>
        </article>
        <article>
          <h3>Field notes</h3>
          <p>Unshipped but interesting repos still get a place when they show taste, systems thinking, or momentum.</p>
        </article>
        <article>
          <h3>Useful pressure</h3>
          <p>The throughline is software that compresses messy inputs into something a person can actually work with.</p>
        </article>
      </div>
    </section>
  {:else if activeTab === 'projects'}
    <section class="portfolio-page">
      <div class="section-heading">
        <span class="eyebrow">Selected work</span>
        <h1>Work index</h1>
        <p>Live demos up top, field notes mixed in. Not everything here is shipped; the useful part is the shape of the thinking.</p>
      </div>

      <div class="project-grid">
        {#each projects as project}
          <a
            id={project.slug}
            class="project-card"
            class:locked-card={project.locked && !isProjectUnlocked(project)}
            href={project.route}
            style={`--project-accent: ${project.accent}`}
            onclick={(event) => handleProjectOpen(event, project)}
          >
            <div>
              <span class="project-status">{project.locked && !isProjectUnlocked(project) ? 'Private set' : project.status}</span>
              <h2>{getProjectTitle(project)}</h2>
              <p class="project-subtitle">{getProjectSubtitle(project)}</p>
              <p>{getProjectDetail(project)}</p>
            </div>
            <div class="tag-list" aria-label={`${getProjectTitle(project)} stack`}>
              {#each getProjectStack(project) as tag}
                <span>{tag}</span>
              {/each}
            </div>
          </a>
        {/each}
      </div>
    </section>
  {:else if activeTab === 'contact'}
    <section class="contact-page">
      <div class="section-heading">
        <span class="eyebrow">Contact</span>
        <h1>Let’s make the next tab useful.</h1>
        <p>
          Add your preferred links here: email, GitHub, LinkedIn, resume, writing, or whatever should be one click away
          for someone reviewing the work.
        </p>
      </div>
      <div class="contact-list">
        <a href="mailto:hello@ethanadams.dev">hello@ethanadams.dev</a>
        <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
        <a href="/" onclick={(event) => navigate(event, '/')}>Resume placeholder</a>
      </div>
    </section>
  {:else if activeProject}
    <section class="demo-shell">
      {@render projectIntro(activeProject)}
      <div class:map-demo={activeTab === 'homesteader'} class:practice-demo={activeTab === 'mandarin'} class="demo-stage">
        {#if activeTab === 'homesteader'}
          <ControlPanel />
          <Map />
        {:else if activeTab === 'mandarin'}
          <MandarinPractice />
        {/if}
      </div>
    </section>
  {/if}

  {#if showDebug}
    <div class="debug-overlay">
      <h3>Debug Info (press 'd' to toggle)</h3>
      <p><strong>County Scores:</strong> {$countyScores.length} counties</p>
      <details>
        <summary>First 5 counties</summary>
        <pre>{JSON.stringify($countyScores.slice(0, 5), null, 2)}</pre>
      </details>
    </div>
  {/if}

  {#if isUnlockOpen && unlockProject}
    <div class="unlock-backdrop">
      <button class="unlock-scrim" type="button" aria-label="Close private set dialog" onclick={closeUnlock}></button>
      <form class="unlock-dialog" onsubmit={(event) => { event.preventDefault(); submitPasscode(); }}>
        <span class="eyebrow">Private set</span>
        <h2>{unlockProject.locked?.title}</h2>
        <p>{unlockProject.locked?.summary}</p>
        <label for="private-passcode">Passcode</label>
        <input
          id="private-passcode"
          type="password"
          autocomplete="current-password"
          bind:value={passcode}
          aria-invalid={passcodeError ? 'true' : 'false'}
        />
        {#if passcodeError}
          <p class="passcode-error">{passcodeError}</p>
        {/if}
        <div class="unlock-actions">
          <button type="button" class="secondary-button" onclick={closeUnlock}>Cancel</button>
          <button type="submit" class="primary-button">Unlock</button>
        </div>
      </form>
    </div>
  {/if}
</main>

{#snippet projectIntro(project: PortfolioProject)}
  <div class="project-intro" style={`--project-accent: ${project.accent}`}>
    <div>
      <span class="eyebrow">{project.status}</span>
      <h1>{project.title}</h1>
      <p class="project-subtitle">{project.subtitle}</p>
      <p>{project.detail}</p>
    </div>
    <div class="project-sidebar">
      <div class="tag-list">
        {#each project.stack as tag}
          <span>{tag}</span>
        {/each}
      </div>
      <div class="metric-row compact">
        {#each project.metrics as metric}
          <span>
            <strong>{metric.value}</strong>
            {metric.label}
          </span>
        {/each}
      </div>
    </div>
  </div>
{/snippet}

<style>
  main {
    min-height: 100%;
    background:
      radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--accent-primary) 18%, transparent), transparent 28rem),
      linear-gradient(135deg, color-mix(in srgb, var(--bg-secondary) 76%, transparent), transparent 34rem),
      var(--bg-primary);
  }

  .demo-mode {
    min-height: 100vh;
  }

  .site-header {
    position: relative;
    display: grid;
    grid-template-columns: minmax(180px, 1fr) auto minmax(76px, 1fr);
    align-items: center;
    gap: 18px;
    width: min(1180px, calc(100% - 32px));
    margin: 0 auto;
    padding: 28px 0 8px;
    z-index: 50;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--text-primary);
    text-decoration: none;
    width: fit-content;
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: 1px solid var(--border-primary);
    border-radius: 50%;
    background: color-mix(in srgb, var(--bg-primary) 74%, transparent);
    color: var(--accent-primary);
    font-weight: 800;
    letter-spacing: 0;
  }

  .brand strong,
  .brand small {
    display: block;
    line-height: 1.15;
  }

  .brand small {
    color: var(--text-tertiary);
    font-size: 12px;
    margin-top: 3px;
  }

  .tab-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    gap: 0;
    padding: 3px;
    border: 1px solid var(--border-primary);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-primary) 70%, transparent);
    box-shadow: var(--shadow-sm);
  }

  .tab-nav a {
    color: var(--text-secondary);
    text-decoration: none;
    padding: 8px 13px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
  }

  .tab-nav a:hover,
  .tab-nav a.active {
    color: var(--text-primary);
    background: color-mix(in srgb, var(--text-primary) 8%, transparent);
  }

  .theme-button {
    justify-self: end;
    width: 64px;
    height: 38px;
    border: 1px solid var(--border-primary);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-primary) 64%, transparent);
    color: var(--text-secondary);
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .hero-section,
  .portfolio-page,
  .contact-page,
  .content-band {
    width: min(1120px, calc(100% - 32px));
    margin: 0 auto;
  }

  .hero-section {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
    gap: clamp(28px, 5vw, 72px);
    align-items: center;
    min-height: calc(100vh - 90px);
    padding: 52px 0 76px;
  }

  .hero-copy h1,
  .section-heading h1 {
    max-width: 820px;
    font-size: clamp(56px, 11vw, 132px);
    line-height: 0.86;
    letter-spacing: 0;
    margin: 10px 0 22px;
  }

  .hero-copy p,
  .section-heading p {
    max-width: 680px;
    color: var(--text-secondary);
    font-size: clamp(18px, 2vw, 21px);
    line-height: 1.55;
  }

  .eyebrow,
  .panel-kicker,
  .project-status {
    color: var(--accent-primary);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 28px;
  }

  .primary-link,
  .secondary-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 18px;
    border-radius: 999px;
    font-weight: 750;
    text-decoration: none;
  }

  .primary-link {
    background: var(--text-primary);
    color: var(--bg-primary);
  }

  .secondary-link {
    border: 1px solid var(--border-primary);
    color: var(--text-primary);
    background: color-mix(in srgb, var(--bg-primary) 64%, transparent);
  }

  .featured-panel,
  .project-card,
  .focus-grid article {
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    background:
      linear-gradient(145deg, color-mix(in srgb, var(--text-primary) 5%, transparent), transparent),
      color-mix(in srgb, var(--bg-primary) 74%, transparent);
    box-shadow: var(--shadow-sm);
  }

  .featured-panel {
    display: block;
    color: var(--text-primary);
    text-decoration: none;
    padding: clamp(24px, 4vw, 34px);
    border-top: 1px solid var(--project-accent);
    box-shadow: var(--shadow-md);
  }

  .featured-panel h2,
  .project-card h2 {
    margin: 12px 0 10px;
    font-size: clamp(28px, 4vw, 40px);
    line-height: 1.05;
  }

  .featured-panel p,
  .project-card p,
  .focus-grid p,
  .project-intro p {
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .metric-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 28px;
  }

  .metric-row span {
    min-height: 70px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--border-primary) 74%, transparent);
    background: color-mix(in srgb, var(--bg-secondary) 78%, transparent);
    color: var(--text-tertiary);
    font-size: 12px;
    font-weight: 700;
  }

  .metric-row strong {
    display: block;
    color: var(--text-primary);
    font-size: 24px;
    line-height: 1;
    margin-bottom: 8px;
  }

  .content-band,
  .portfolio-page,
  .contact-page {
    padding: 72px 0 96px;
  }

  .section-heading h2 {
    margin: 10px 0 0;
    font-size: clamp(32px, 5vw, 54px);
    line-height: 1;
    letter-spacing: 0;
  }

  .focus-grid,
  .project-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-top: 28px;
  }

  .focus-grid article {
    padding: 22px;
  }

  .focus-grid h3 {
    margin-bottom: 10px;
    font-size: 18px;
  }

  .project-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    align-items: stretch;
  }

  .project-card {
    grid-column: span 3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 28px;
    min-height: 330px;
    padding: 26px;
    color: var(--text-primary);
    text-decoration: none;
    border-top: 1px solid var(--project-accent);
    scroll-margin-top: 24px;
    transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
  }

  .project-card:first-child {
    grid-column: span 6;
    min-height: 300px;
  }

  .project-card:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--project-accent) 70%, var(--border-primary));
    background:
      linear-gradient(145deg, color-mix(in srgb, var(--project-accent) 9%, transparent), transparent),
      color-mix(in srgb, var(--bg-primary) 78%, transparent);
  }

  .project-card.locked-card {
    border-style: dashed;
  }

  .project-card.locked-card:hover {
    background:
      linear-gradient(145deg, color-mix(in srgb, var(--accent-gold) 9%, transparent), transparent),
      color-mix(in srgb, var(--bg-primary) 78%, transparent);
  }

  .project-subtitle {
    font-weight: 750;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag-list span {
    padding: 7px 9px;
    border: 1px solid var(--border-primary);
    border-radius: 999px;
    background: color-mix(in srgb, var(--bg-secondary) 78%, transparent);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 750;
  }

  .contact-list {
    display: grid;
    gap: 10px;
    max-width: 560px;
    margin-top: 28px;
  }

  .contact-list a {
    padding: 18px;
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    background: color-mix(in srgb, var(--bg-primary) 76%, transparent);
    color: var(--text-primary);
    font-weight: 750;
    text-decoration: none;
  }

  .unlock-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: center;
    padding: 18px;
    background: color-mix(in srgb, var(--bg-primary) 24%, rgba(0, 0, 0, 0.72));
    backdrop-filter: blur(12px);
  }

  .unlock-scrim {
    position: absolute;
    inset: 0;
    border: 0;
    background: transparent;
    cursor: default;
  }

  .unlock-dialog {
    position: relative;
    z-index: 1;
    width: min(420px, 100%);
    padding: 24px;
    border: 1px solid var(--border-primary);
    border-top-color: var(--accent-primary);
    border-radius: 8px;
    background: var(--bg-primary);
    box-shadow: var(--shadow-md);
  }

  .unlock-dialog h2 {
    margin: 10px 0;
    font-size: 28px;
    line-height: 1.05;
    letter-spacing: 0;
  }

  .unlock-dialog p {
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .unlock-dialog label {
    display: block;
    margin-top: 22px;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .unlock-dialog input {
    width: 100%;
    height: 44px;
    margin-top: 8px;
    padding: 0 12px;
    border: 1px solid var(--border-primary);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font: inherit;
    font-weight: 700;
  }

  .unlock-dialog input:focus {
    outline: 2px solid color-mix(in srgb, var(--accent-primary) 42%, transparent);
    outline-offset: 2px;
  }

  .unlock-dialog input[aria-invalid='true'] {
    border-color: var(--accent-primary);
  }

  .passcode-error {
    margin-top: 8px;
    color: var(--accent-primary) !important;
    font-size: 13px;
    font-weight: 750;
  }

  .unlock-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 22px;
  }

  .primary-button,
  .secondary-button {
    min-width: 92px;
    height: 40px;
    padding: 0 14px;
    border-radius: 999px;
    font: inherit;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
  }

  .primary-button {
    border: 1px solid var(--text-primary);
    background: var(--text-primary);
    color: var(--bg-primary);
  }

  .secondary-button {
    border: 1px solid var(--border-primary);
    background: transparent;
    color: var(--text-primary);
  }

  .demo-shell {
    min-height: calc(100vh - 67px);
  }

  .project-intro {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(300px, 420px);
    gap: 32px;
    width: min(1120px, calc(100% - 32px));
    margin: 0 auto;
    padding: 52px 0 28px;
    border-bottom: 1px solid var(--border-primary);
  }

  .project-intro .eyebrow,
  .project-card .project-status {
    color: var(--project-accent);
  }

  .project-intro h1 {
    margin: 8px 0;
    font-size: clamp(34px, 5vw, 62px);
    line-height: 1;
    letter-spacing: 0;
  }

  .project-sidebar {
    display: grid;
    align-content: start;
    gap: 16px;
  }

  .metric-row.compact {
    margin-top: 0;
  }

  .metric-row.compact span {
    min-height: 62px;
  }

  .demo-stage {
    margin-top: 24px;
  }

  .map-demo {
    position: relative;
    display: flex;
    width: 100%;
    height: min(760px, calc(100vh - 92px));
    min-height: 620px;
    border-top: 1px solid var(--border-primary);
    border-bottom: 1px solid var(--border-primary);
    overflow: hidden;
  }

  .practice-demo {
    width: min(1120px, calc(100% - 32px));
    margin-inline: auto;
    padding-bottom: 56px;
  }

  .debug-overlay {
    position: fixed;
    top: 86px;
    right: 14px;
    background: var(--overlay-bg);
    color: var(--text-primary);
    padding: 18px;
    border-radius: 8px;
    border: 2px solid var(--border-primary);
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 9999;
    font-size: 14px;
    box-shadow: var(--shadow-md);
  }

  .debug-overlay h3 {
    margin: 0 0 10px;
    color: var(--accent-primary);
  }

  .debug-overlay pre {
    background: var(--bg-tertiary);
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 11px;
  }

  @media (max-width: 860px) {
    .site-header {
      grid-template-columns: 1fr auto;
      gap: 12px;
    }

    .tab-nav {
      grid-column: 1 / -1;
      justify-content: flex-start;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .hero-section,
    .project-intro {
      grid-template-columns: 1fr;
    }

    .hero-section {
      min-height: auto;
      padding-top: 40px;
    }

    .focus-grid,
    .project-grid {
      grid-template-columns: 1fr;
    }

    .map-demo {
      flex-direction: column;
      height: auto;
      min-height: 900px;
    }
  }

  @media (max-width: 560px) {
    .site-header {
      padding-inline: 12px;
    }

    .brand small {
      display: none;
    }

    .theme-button {
      width: 58px;
    }

    .hero-copy h1,
    .section-heading h1 {
      font-size: 40px;
    }

    .metric-row {
      grid-template-columns: 1fr;
    }
  }
</style>
