// useAudio.ts
import { useRef, useCallback } from "react";

export const useAudio = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    const playTone = useCallback((frequency: number) => {
        // Initialize AudioContext on first user interaction (browser requirement)
        if (!audioContextRef.current) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioCtx();
        }

        const ctx = audioContextRef.current;
        if (ctx?.state === "suspended") {
            ctx.resume();
        }

        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Sound Design: Sawtooth + Lowpass filter mimics a string instrument better
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, ctx.currentTime); // Cutoff high fizz

        // Envelope (Attack and Release)
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5); // Decay

        // Connect graph
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.5);
    }, []);

    return { playTone };
};
