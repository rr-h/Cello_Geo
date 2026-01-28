// musicData.ts

export type NoteName = string;
export type StringName = "C" | "G" | "D" | "A";
export type AccidentalMode = "sharp" | "flat";
export type ExtensionMode = "closed" | "backward" | "forward";

export interface PositionConfig {
    id: string;
    label: string;
    startSemitone: number;
}

// Base frequency for Low C (C2)
const BASE_FREQ_C2 = 65.41;

export const STRINGS: Record<StringName, number> = {
    C: 0,
    G: 7,
    D: 14,
    A: 21,
};

const CHROMATIC_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const CHROMATIC_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export const POSITIONS: PositionConfig[] = [
    { id: "half", label: "Half Position", startSemitone: 1 },
    { id: "first", label: "1st Position", startSemitone: 2 },
    { id: "lower-second", label: "Lower 2nd Position", startSemitone: 3 },
    { id: "second", label: "2nd Position", startSemitone: 4 },
    { id: "third", label: "3rd Position", startSemitone: 5 },
    { id: "fourth", label: "4th Position", startSemitone: 7 },
];

// Determine relative semitones for the 4 finger slots based on hand shape
// Slot 0 = Index, Slot 1 = Middle, Slot 2 = Ring, Slot 3 = Pinky
export const getFingerOffsets = (mode: ExtensionMode): number[] => {
    switch (mode) {
        case "backward":
            // Index reaches back (-1), large gap to Middle (1), then chromatic
            return [-1, 1, 2, 3];
        case "forward":
            // Index stays (0), large gap to Middle (2), then chromatic
            return [0, 2, 3, 4];
        case "closed":
        default:
            // Standard chromatic closed hand
            return [0, 1, 2, 3];
    }
};

export const getNoteInfo = (
    stringName: StringName,
    semitoneOffset: number, // From position start
    positionStart: number,
    mode: AccidentalMode,
) => {
    const openStringVal = STRINGS[stringName];
    // Total semitones from Low C (C2)
    const totalSemitones = openStringVal + positionStart + semitoneOffset;

    // 1. Get Name
    const noteIndex = ((totalSemitones % 12) + 12) % 12; // Handle negative modulo if extension goes below C (rare but safe)
    const name = mode === "sharp" ? CHROMATIC_SHARP[noteIndex] : CHROMATIC_FLAT[noteIndex];

    // 2. Get Frequency
    // Formula: f = f0 * (2)^(n/12)
    const frequency = BASE_FREQ_C2 * Math.pow(2, totalSemitones / 12);

    return { name, frequency, totalSemitones };
};
