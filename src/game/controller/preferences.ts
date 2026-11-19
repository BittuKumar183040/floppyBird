export interface GamePreferences {
    music: boolean;
    effects: boolean;
    difficulty: GameMode;
}

export type GameMode = 'chill' | 'classic' | 'spicy';

const STORAGE_KEY = 'floppyBirdPreferences';
const defaults: GamePreferences = { music: true, effects: true, difficulty: 'classic' };

const normalizeMode = (value: unknown): GameMode => {
    if (value === 'chill' || value === 'classic' || value === 'spicy') return value;
    const legacyValue = Number(value);
    if (Number.isFinite(legacyValue) && legacyValue < 0.8) return 'chill';
    if (Number.isFinite(legacyValue) && legacyValue > 1.2) return 'spicy';
    return 'classic';
};

export const getPreferences = (): GamePreferences => {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<GamePreferences>;
        return {
            music: typeof saved.music === 'boolean' ? saved.music : defaults.music,
            effects: typeof saved.effects === 'boolean' ? saved.effects : defaults.effects,
            difficulty: normalizeMode(saved.difficulty),
        };
    } catch {
        return { ...defaults };
    }
};

let context: AudioContext | undefined;
let musicGain: GainNode | undefined;
let musicTimer: number | undefined;
let musicStep = 0;

const ensureAudio = () => {
    if (context) return context;
    const AudioContextType = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextType) return undefined;
    context = new AudioContextType();
    musicGain = context.createGain();
    musicGain.gain.value = 0.55;
    musicGain.connect(context.destination);
    return context;
};

const playMusicNote = (frequency: number, duration: number, type: OscillatorType, volume: number) => {
    if (!context || !musicGain || context.state !== 'running') return;
    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(0.001, start);
    envelope.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(envelope).connect(musicGain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
};

const startMusicLoop = () => {
    if (musicTimer !== undefined) return;
    const melody = [659, 784, 988, 784, 880, 784, 659, 587, 523, 587, 659, 784, 659, 587, 523, 587];
    const bass = [131, 131, 196, 196, 165, 165, 196, 196, 110, 110, 165, 165, 131, 131, 196, 196];
    musicTimer = window.setInterval(() => {
        if (!context || context.state !== 'running' || !getPreferences().music) return;
        const note = melody[musicStep % melody.length];
        playMusicNote(note, 0.14, 'square', 0.16);
        if (musicStep % 2 === 0) playMusicNote(bass[musicStep % bass.length], 0.24, 'triangle', 0.22);
        musicStep += 1;
    }, 155);
};

export const refreshMusic = () => {
    if (!getPreferences().music) {
        if (musicTimer !== undefined) {
            window.clearInterval(musicTimer);
            musicTimer = undefined;
            musicStep = 0;
        }
        return;
    }
    const audio = ensureAudio();
    if (!audio || !musicGain) return;
    void audio.resume().then(() => {
        if (getPreferences().music) startMusicLoop();
    }).catch(() => undefined);
};

export const playEffect = (kind: 'flap' | 'score' | 'record' | 'dead') => {
    if (!getPreferences().effects) return;
    const audio = ensureAudio();
    if (!audio) return;
    void audio.resume();
    const now = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const notes = { flap: [520, 760], score: [680, 920], record: [520, 1040], dead: [300, 90] }[kind];
    oscillator.type = kind === 'dead' ? 'sawtooth' : 'sine';
    oscillator.frequency.setValueAtTime(notes[0], now);
    oscillator.frequency.exponentialRampToValueAtTime(notes[1], now + (kind === 'record' ? 0.42 : 0.16));
    gain.gain.setValueAtTime(kind === 'record' ? 0.12 : 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (kind === 'record' ? 0.48 : 0.2));
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + (kind === 'record' ? 0.5 : 0.22));
};

export const openSettings = (parent: HTMLElement, onClose?: () => void, options: { showDifficulty?: boolean } = {}) => {
    const settings = getPreferences();
    const difficultyControl = options.showDifficulty === false ? '' : `
        <div class="settings-difficulty">
          <div class="difficulty-heading"><span>Difficulty</span><strong>${settings.difficulty.toUpperCase()} · ${settings.difficulty === 'chill' ? 1 : settings.difficulty === 'classic' ? 2 : 3} PT/PIPE</strong></div>
          <input name="difficulty" type="range" min="0" max="2" step="1" value="${settings.difficulty === 'chill' ? 0 : settings.difficulty === 'classic' ? 1 : 2}" aria-label="Difficulty: Chill, Classic, or Spicy">
          <div class="difficulty-labels"><span class="${settings.difficulty === 'chill' ? 'selected' : ''}">CHILL</span><span class="${settings.difficulty === 'classic' ? 'selected' : ''}">CLASSIC</span><span class="${settings.difficulty === 'spicy' ? 'selected' : ''}">SPICY</span></div>
        </div>`;
    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.innerHTML = `
      <section class="settings-card" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <button class="settings-close" type="button" aria-label="Close settings">×</button>
        <h2 id="settings-title">Flight settings</h2>
        <label class="settings-option"><span>Background music</span><input name="music" type="checkbox" ${settings.music ? 'checked' : ''}></label>
        <label class="settings-option"><span>Sound effects</span><input name="effects" type="checkbox" ${settings.effects ? 'checked' : ''}></label>
        ${difficultyControl}
      </section>`;
    parent.appendChild(overlay);
    const close = () => {
        overlay.remove();
        document.removeEventListener('keydown', onKeyDown);
        onClose?.();
    };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    document.addEventListener('keydown', onKeyDown);
    overlay.querySelector('.settings-close')?.addEventListener('click', close);
    overlay.addEventListener('pointerdown', (event) => { if (event.target === overlay) close(); });
    ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend'].forEach((eventName) => {
        overlay.addEventListener(eventName, (event) => event.stopPropagation());
    });
    overlay.querySelector<HTMLInputElement>('input[name="music"]')?.addEventListener('change', (event) => {
        const value = (event.currentTarget as HTMLInputElement).checked;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getPreferences(), music: value }));
        refreshMusic();
    });
    overlay.querySelector<HTMLInputElement>('input[name="effects"]')?.addEventListener('change', (event) => {
        const value = (event.currentTarget as HTMLInputElement).checked;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getPreferences(), effects: value }));
    });
    overlay.querySelector<HTMLInputElement>('input[name="difficulty"]')?.addEventListener('input', (event) => {
        const position = Number((event.currentTarget as HTMLInputElement).value);
        const value: GameMode = position === 0 ? 'chill' : position === 2 ? 'spicy' : 'classic';
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getPreferences(), difficulty: value }));
        const heading = overlay.querySelector('.difficulty-heading strong');
        if (heading) heading.textContent = `${value.toUpperCase()} · ${value === 'chill' ? 1 : value === 'classic' ? 2 : 3} PT/PIPE`;
        overlay.querySelectorAll('.difficulty-labels span').forEach((label, index) => {
            label.classList.toggle('selected', index === position);
        });
    });
    overlay.querySelector<HTMLButtonElement>('.settings-close')?.focus();
    refreshMusic();
    return overlay;
};

export interface ScoreRecord { username: string; score: number; date: string; mode: GameMode; }
const SCORE_KEY = 'floppyBirdScores';
const BEST_KEY = 'floppyBirdBestScores';

const currentPlayerKey = () => (localStorage.getItem('username')?.trim() || 'Guest').toLowerCase();

export const getScoreHistory = (): ScoreRecord[] => {
    try {
        const parsed = JSON.parse(localStorage.getItem(SCORE_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.flatMap((record): ScoreRecord[] => {
            if (!record || typeof record.username !== 'string' || !Number.isFinite(Number(record.score)) || typeof record.date !== 'string') return [];
            return [{ username: record.username, score: Number(record.score), date: record.date, mode: normalizeMode(record.mode) }];
        }) : [];
    } catch { return []; }
};

export const getBestScore = (mode: GameMode) => {
    try {
        const profiles = JSON.parse(localStorage.getItem(BEST_KEY) || '{}') as Record<string, Partial<Record<GameMode, number>>>;
        const score = Number(profiles[currentPlayerKey()]?.[mode]);
        if (Number.isFinite(score)) return score;
    } catch { /* Treat malformed local data as an empty score table. */ }
    return mode === 'classic' ? Number(localStorage.getItem('highscore')) || 0 : 0;
};

export const getBestScores = (): Record<GameMode, number> => ({
    chill: getBestScore('chill'), classic: getBestScore('classic'), spicy: getBestScore('spicy'),
});

export const saveBestScore = (mode: GameMode, score: number) => {
    if (score <= getBestScore(mode)) return;
    let profiles: Record<string, Partial<Record<GameMode, number>>> = {};
    try { profiles = JSON.parse(localStorage.getItem(BEST_KEY) || '{}'); } catch { /* Replace malformed data. */ }
    const playerKey = currentPlayerKey();
    profiles[playerKey] = { ...profiles[playerKey], [mode]: score };
    localStorage.setItem(BEST_KEY, JSON.stringify(profiles));
    if (mode === 'classic') localStorage.setItem('highscore', String(score));
};

export const saveScore = (username: string, score: number, mode: GameMode) => {
    if (!username.trim() || score < 0) return;
    const records = getScoreHistory();
    records.unshift({ username: username.trim(), score, date: new Date().toISOString(), mode });
    localStorage.setItem(SCORE_KEY, JSON.stringify(records.slice(0, 100)));
};
