/**
 * Centralized Hebrew Audio Service
 * Handles Speech Synthesis with robust voice selection and Google TTS fallback.
 */

class AudioService {
    private voices: SpeechSynthesisVoice[] = [];
    private isInitialized = false;
    private currentAudio: HTMLAudioElement | null = null;

    constructor() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            this.init();
        }
    }

    private init() {
        const loadVoices = () => {
            if (typeof window === 'undefined') return;
            this.voices = window.speechSynthesis.getVoices();
            if (this.voices.length > 0) {
                this.isInitialized = true;
                console.log(`[AudioService] Loaded ${this.voices.length} voices.`);
            }
        };

        if (typeof window !== 'undefined') {
            loadVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }

            // Periodic check for lazy-loading browsers
            const interval = setInterval(() => {
                if (this.voices.length > 0) {
                    clearInterval(interval);
                } else {
                    loadVoices();
                }
            }, 1000);
        }
    }

    /**
     * Stop all current audio playback
     */
    public stop() {
        if (typeof window === 'undefined') return;

        // Stop SpeechSynthesis
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        // Stop HTML5 Audio
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
    }

    /**
     * Play Hebrew text using Google TTS or SpeechSynthesis fallback.
     * Optimized for browser gesture preservation and connectivity.
     */
    public async playHebrew(text: string, rate: number = 0.8) {
        if (typeof window === 'undefined') return;

        // 1. Stop any currently playing audio immediately
        this.stop();

        // 2. Format the Google TTS URL
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=he&client=tw-ob`;

        // 3. Create audio object
        // NOTE: We do NOT use .crossOrigin to avoid CORS blocks on simple GET requests for media
        const audio = new Audio();
        audio.src = url;
        audio.playbackRate = rate;
        this.currentAudio = audio;

        try {
            // 4. Play immediately to satisfy "User Gesture" requirements
            // If the browser blocks it (autoplay/permission), it will throw here
            await audio.play();
            console.log(`[AudioService] Playing (Google TTS): ${text}`);

            // Wait for completion
            return new Promise<void>((resolve) => {
                audio.onended = () => {
                    this.currentAudio = null;
                    resolve();
                };
                audio.onerror = async () => {
                    console.warn('[AudioService] Google TTS error, falling back...');
                    await this.playLocalFallback(text, rate);
                    resolve();
                };
            });
        } catch (error) {
            console.warn('[AudioService] Play blocked or failed, using local fallback:', error);
            await this.playLocalFallback(text, rate);
        }
    }

    /**
     * Fallback to browser's built-in SpeechSynthesis.
     * Automatically strips niqqud (Hebrew vowels) to ensure compatibility with most voice engines.
     */
    private async playLocalFallback(text: string, rate: number = 0.8) {
        if (!('speechSynthesis' in window)) {
            console.error('[AudioService] Speech Synthesis not supported.');
            return;
        }

        // Strip Niqqud/Vowels (Unicode range \u0591-\u05C7)
        // This is CRITICAL because most basic OS voice engines cannot read vowel-pointed Hebrew
        const cleanText = text.replace(/[\u0591-\u05C7]/g, "");

        const utterance = new SpeechSynthesisUtterance(cleanText);

        // Best effort voice selection
        const hebrewVoice = this.voices.find(v => v.lang === 'he-IL') ||
            this.voices.find(v => v.lang.startsWith('he')) ||
            this.voices[0];

        if (hebrewVoice) {
            utterance.voice = hebrewVoice;
        }

        utterance.lang = 'he-IL';
        utterance.rate = rate;
        utterance.pitch = 1;

        console.log(`[AudioService] Local Fallback (Cleaned): ${cleanText}`);
        window.speechSynthesis.speak(utterance);

        return new Promise<void>((resolve) => {
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            setTimeout(resolve, 3000); // Failsafe timeout
        });
    }

    public async playTamil(text: string, rate: number = 0.9) {
        if (typeof window === 'undefined') return;

        // 1. Stop any currently playing audio immediately
        this.stop();

        // 2. Format the Google TTS URL for Tamil
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ta&client=tw-ob`;

        // 3. Create audio object
        const audio = new Audio();
        audio.src = url;
        audio.playbackRate = rate;
        this.currentAudio = audio;

        try {
            await audio.play();
            console.log(`[AudioService] Playing (Tamil (Google TTS)): ${text}`);

            // Wait for completion
            return new Promise<void>((resolve) => {
                audio.onended = () => {
                    this.currentAudio = null;
                    resolve();
                };
                audio.onerror = async () => {
                    this.currentAudio = null;
                    console.warn('[AudioService] Tamil play failed, using fallback');
                    await this.playLocalTamilFallback(text, rate);
                    resolve();
                };
            });
        } catch (error) {
            console.warn('[AudioService] Tamil play blocked:', error);
            await this.playLocalTamilFallback(text, rate);
        }
    }

    private async playLocalTamilFallback(text: string, rate: number = 0.9) {
        if (!('speechSynthesis' in window)) {
            console.error('[AudioService] Speech Synthesis not supported.');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a Tamil voice
        const tamilVoice = this.voices.find(v => v.lang === 'ta-IN') ||
            this.voices.find(v => v.lang.startsWith('ta')) ||
            this.voices[0];

        if (tamilVoice) {
            utterance.voice = tamilVoice;
        }

        utterance.lang = 'ta-IN';
        utterance.rate = rate;
        utterance.pitch = 1;

        console.log(`[AudioService] Local Fallback (Tamil): ${text}`);
        window.speechSynthesis.speak(utterance);

        return new Promise<void>((resolve) => {
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            setTimeout(resolve, 3000); // Failsafe timeout
        });
    }
}

export const audioService = new AudioService();
