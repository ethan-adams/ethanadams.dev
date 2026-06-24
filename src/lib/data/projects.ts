export type PortfolioProject = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  detail: string;
  stack: string[];
  status: string;
  accent: string;
  route: string;
  locked?: {
    storageKey: string;
    passcode: string;
    title: string;
    subtitle: string;
    summary: string;
    detail: string;
  };
  metrics: {
    label: string;
    value: string;
  }[];
};

export const projects: PortfolioProject[] = [
  {
    slug: 'ccp-signal',
    title: 'CCP Signal',
    subtitle: 'China Media Intelligence Feed',
    summary:
      'A source-first intelligence system for tracking official Chinese media, clustering coverage, and watching shifts in political language.',
    detail:
      'RSS ingestion, translation queues, embeddings, clustering, and analyst lenses come together as a quieter way to notice what official sources amplify, repeat, bury, or reframe.',
    stack: ['Python', 'FastAPI', 'Postgres', 'Qdrant', 'Embeddings', 'RSS'],
    status: 'Active system',
    accent: '#a84c3d',
    route: '/projects#ccp-signal',
    locked: {
      storageKey: 'private-set-ccp-signal',
      passcode: 'signal',
      title: 'Private Intelligence Set',
      subtitle: 'Passcode Required',
      summary: 'A private system writeup is available by passcode.',
      detail:
        'This project is intentionally hidden from the public index for now. Use the passcode to reveal the full title, context, stack, and notes on the page.',
    },
    metrics: [
      { label: 'Focus', value: 'China' },
      { label: 'Shape', value: 'Feed' },
      { label: 'Layer', value: 'Signal' },
    ],
  },
  {
    slug: 'homesteader',
    title: 'Homesteader',
    subtitle: 'County Fit Mapper',
    summary:
      'An interactive decision tool for comparing Western U.S. counties across land, climate, connectivity, and lifestyle tradeoffs.',
    detail:
      'The app turns messy public data into a ranked map. Visitors can reorder weighted dimensions, test preset priorities, and see how counties shift under different definitions of a good place to live.',
    stack: ['Svelte', 'TypeScript', 'MapLibre', 'GeoJSON', 'Vite'],
    status: 'Interactive demo',
    accent: '#2f7d52',
    route: '/homesteader',
    metrics: [
      { label: 'Data layers', value: '9' },
      { label: 'Counties', value: '500+' },
      { label: 'Mode', value: 'Map' },
    ],
  },
  {
    slug: 'garden-nursery',
    title: 'Garden Nursery',
    subtitle: 'Cozy Systems Game',
    summary:
      'A Steam Deck-first Godot game about starting a roadside nursery, learning local plants, and becoming part of a place.',
    detail:
      'The repo is mostly product direction and vertical-slice planning right now: region design, Steam Deck UX, art direction, issue workflow, and a path toward a playable nursery loop.',
    stack: ['Godot', 'Game Design', 'Steam Deck UX', 'Narrative Systems'],
    status: 'Vertical slice',
    accent: '#7f9d73',
    route: '/projects#garden-nursery',
    metrics: [
      { label: 'Engine', value: 'Godot' },
      { label: 'Target', value: 'Deck' },
      { label: 'Mode', value: 'Cozy' },
    ],
  },
  {
    slug: 'mandarin',
    title: 'Mandarin Practice',
    subtitle: 'Local Review Trainer',
    summary:
      'A lightweight spaced-repetition drill for practicing Mandarin call-and-response prompts with speech playback.',
    detail:
      'The prototype stores progress locally, separates due/new/all review modes, and uses browser speech synthesis to make pronunciation part of the feedback loop.',
    stack: ['Svelte', 'TypeScript', 'LocalStorage', 'Web Speech API'],
    status: 'Prototype',
    accent: '#c54f35',
    route: '/mandarin',
    metrics: [
      { label: 'Review modes', value: '3' },
      { label: 'Storage', value: 'Local' },
      { label: 'Audio', value: 'Speech' },
    ],
  },
  {
    slug: 'mandarin-cli',
    title: 'Mandarin Lesson Practice',
    subtitle: 'Tutor PDF to Review Loop',
    summary:
      'Local CLI tools for turning Mandarin lesson PDFs into structured call-and-response practice with review state and speech.',
    detail:
      'The CLI handles ingest, extraction, validation, expansion, due-card practice, and audiobook-style speaking sessions that record your response before playing the native answer.',
    stack: ['Python', 'Typer', 'PDF Tools', 'Text to Speech', 'Local Audio'],
    status: 'Daily tool',
    accent: '#c78345',
    route: '/projects#mandarin-cli',
    metrics: [
      { label: 'Input', value: 'PDF' },
      { label: 'Loop', value: 'SRS' },
      { label: 'Mode', value: 'Voice' },
    ],
  },
  {
    slug: 'sonicpi-tools',
    title: 'Sonic Pi Tools',
    subtitle: 'Sample and Beat Sketchbook',
    summary:
      'A small collection of Sonic Pi samples and beat experiments, useful as an archive of audio sketches rather than a polished product.',
    detail:
      'This belongs on the site as texture: a signal that the work is not only dashboards and utilities, but also instruments, loops, and playful systems.',
    stack: ['Sonic Pi', 'Ruby', 'Audio', 'Live Coding'],
    status: 'Sketchbook',
    accent: '#6d7fc4',
    route: '/projects#sonicpi-tools',
    metrics: [
      { label: 'Medium', value: 'Audio' },
      { label: 'Shape', value: 'Beats' },
      { label: 'Energy', value: 'Loose' },
    ],
  },
];

export const featuredProject = projects.find((project) => project.slug === 'ccp-signal') ?? projects[0];
