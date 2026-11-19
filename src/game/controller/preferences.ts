export interface GamePreferences {
    music: boolean;
    effects: boolean;
    difficulty: number;
}

const STORAGE_KEY = 'floppyBirdPreferences';
const defaults: GamePreferences = { music: true, effects: true, difficulty: 1 };

export const getPreferences = (): GamePreferences => {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<GamePreferences>;
        return {
            music: typeof saved.music === 'boolean' ? saved.music : defaults.music,
            effects: typeof saved.effects === 'boolean' ? saved.effects : defaults.effects,
            difficulty: Phaser.Math.Clamp(Number(saved.difficulty) || 1, 0.5, 1.5),
        };
    } catch {
        return { ...defaults };
    }
};

let context: AudioContext | undefined;
let musicGain: GainNode | undefined;

const ensureAudio = () => {
    if (context) return context;
    const AudioContextType = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextType) return undefined;
    context = new AudioContextType();
    musicGain = context.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(context.destination);
    [196, 246.94, 293.66].forEach((frequency, index) => {
        const oscillator = context!.createOscillator();
        const voiceGain = context!.createGain();
        oscillator.type = index === 0 ? 'triangle' : 'sine';
        oscillator.frequency.value = frequency;
        voiceGain.gain.value = index === 0 ? 0.38 : 0.2;
        oscillator.connect(voiceGain).connect(musicGain!);
        oscillator.start();
    });
    return context;
};

export const refreshMusic = () => {
    const audio = ensureAudio();
    if (!audio || !musicGain) return;
    const enabled = getPreferences().music;
    if (enabled) void audio.resume();
    musicGain.gain.setTargetAtTime(enabled ? 0.035 : 0, audio.currentTime, 0.25);
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

export const openSettings = (parent: HTMLElement, onClose?: () => void) => {
    const settings = getPreferences();
    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.innerHTML = `
      <section class="settings-card" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <button class="settings-close" type="button" aria-label="Close settings">×</button>
        <h2 id="settings-title">Flight settings</h2>
        <label class="settings-option"><span>Background music</span><input name="music" type="checkbox" ${settings.music ? 'checked' : ''}></label>
        <label class="settings-option"><span>Sound effects</span><input name="effects" type="checkbox" ${settings.effects ? 'checked' : ''}></label>
        <label class="settings-difficulty"><span>Difficulty <strong>${Math.round(settings.difficulty * 100)}%</strong></span>
          <input name="difficulty" type="range" min="0.5" max="1.5" step="0.05" value="${settings.difficulty}">
          <small>CHILL <span>CLASSIC</span> SPICY</small>
        </label>
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
        const value = Number((event.currentTarget as HTMLInputElement).value);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getPreferences(), difficulty: value }));
        const output = overlay.querySelector('strong');
        if (output) output.textContent = `${Math.round(value * 100)}%`;
    });
    overlay.querySelector<HTMLButtonElement>('.settings-close')?.focus();
    refreshMusic();
    return overlay;
};

export interface ScoreRecord { username: string; score: number; date: string; }
const SCORE_KEY = 'floppyBirdScores';

export const getScoreHistory = (): ScoreRecord[] => {
    try {
        const parsed = JSON.parse(localStorage.getItem(SCORE_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.flatMap((record): ScoreRecord[] => {
            if (!record || typeof record.username !== 'string' || !Number.isFinite(Number(record.score)) || typeof record.date !== 'string') return [];
            return [{ username: record.username, score: Number(record.score), date: record.date }];
        }) : [];
    } catch { return []; }
};

export const saveScore = (username: string, score: number) => {
    if (!username.trim() || score < 0) return;
    const records = getScoreHistory();
    records.unshift({ username: username.trim(), score, date: new Date().toISOString() });
    localStorage.setItem(SCORE_KEY, JSON.stringify(records.slice(0, 100)));
};
