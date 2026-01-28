import React, { useState, useEffect } from "react";
import "./App.css";
import { NoteNode } from "./NoteNode";
import { useAudio } from "./useAudio";
import {
    STRINGS,
    POSITIONS,
    getNoteInfo,
    getFingerOffsets,
    StringName,
    PositionConfig,
    AccidentalMode,
    ExtensionMode,
} from "./musicData";

const App: React.FC = () => {
    const { playTone } = useAudio();

    // -- State --
    const [position, setPosition] = useState<PositionConfig>(POSITIONS[1]);
    const [accidental, setAccidental] = useState<AccidentalMode>("flat");
    const [extMode, setExtMode] = useState<ExtensionMode>("closed");
    const [mode, setMode] = useState<"explore" | "quiz">("explore");

    const [revealedNotes, setRevealedNotes] = useState<Set<string>>(new Set());

    // Quiz State
    const [targetNote, setTargetNote] = useState<{ name: string; id: string } | null>(null);
    const [message, setMessage] = useState("Click a circle to see the note!");

    // Progress State (Scores per position id)
    const [scores, setScores] = useState<Record<string, number>>({});

    // -- Effects --

    // Load scores on mount
    useEffect(() => {
        const saved = localStorage.getItem("cello-geo-scores");
        if (saved) {
            setScores(JSON.parse(saved));
        }
    }, []);

    // Save scores on update
    useEffect(() => {
        localStorage.setItem("cello-geo-scores", JSON.stringify(scores));
    }, [scores]);

    // Reset view when settings change
    useEffect(() => {
        setRevealedNotes(new Set());
        if (mode === "quiz") generateQuestion();
    }, [position, accidental, extMode, mode]);

    // -- Logic --

    const generateQuestion = () => {
        const strings = Object.keys(STRINGS) as StringName[];
        const randString = strings[Math.floor(Math.random() * strings.length)];

        // Get valid finger offsets for current extension mode
        const offsets = getFingerOffsets(extMode);
        const randOffset = offsets[Math.floor(Math.random() * offsets.length)];

        const { name } = getNoteInfo(randString, randOffset, position.startSemitone, accidental);
        const uniqueId = `${randString}-${randOffset}`;

        setTargetNote({ name, id: uniqueId });
        setMessage(`Find: ${name}`);
    };

    const handleNoteClick = (
        stringName: StringName,
        fingerOffset: number,
        noteName: string,
        freq: number,
    ) => {
        const uniqueId = `${stringName}-${fingerOffset}`;

        // Always play sound on click
        playTone(freq);

        if (mode === "explore") {
            const newRevealed = new Set(revealedNotes);
            if (newRevealed.has(uniqueId)) {
                newRevealed.delete(uniqueId);
            } else {
                newRevealed.add(uniqueId);
            }
            setRevealedNotes(newRevealed);
            setMessage(`That is ${noteName}`);
        } else if (mode === "quiz" && targetNote) {
            if (noteName === targetNote.name) {
                // Correct Answer
                setMessage("Correct! 🎉");

                // Update Score for this position
                setScores((prev) => ({
                    ...prev,
                    [position.id]: (prev[position.id] || 0) + 1,
                }));

                // Next question after delay
                setTimeout(() => {
                    generateQuestion();
                }, 1200);
            } else {
                // Wrong Answer
                setMessage(`Try again! That was ${noteName}`);
                // Optional: decrement score?
            }
        }
    };

    // Helper to determine visual class for extension
    const getShiftClass = (index: number) => {
        if (extMode === "backward" && index === 0) return "shift-back"; // 1st finger moves back
        if (extMode === "forward" && index > 0) return "shift-fwd"; // Others move fwd
        return "";
    };

    return (
        <div className="app-container">
            <header>
                <h1>🎻 Cello Geography</h1>
            </header>

            <div className="controls">
                {/* Row 1: Position & Progress */}
                <div className="control-group">
                    <div className="label-text">Select Neighborhood</div>
                    <select
                        className="pos-select"
                        value={position.id}
                        onChange={(e) =>
                            setPosition(
                                POSITIONS.find((p) => p.id === e.target.value) || POSITIONS[0],
                            )
                        }
                    >
                        {POSITIONS.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.label} {scores[p.id] ? `(🏆 ${scores[p.id]})` : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Row 2: Hand Shape (Extensions) */}
                <div className="control-group">
                    <div className="label-text">Hand Shape</div>
                    <button
                        className={`ext-btn ${extMode === "backward" ? "active" : ""}`}
                        onClick={() => setExtMode("backward")}
                    >
                        ← Extend Back (x1)
                    </button>
                    <button
                        className={`ext-btn ${extMode === "closed" ? "active" : ""}`}
                        onClick={() => setExtMode("closed")}
                    >
                        Closed Hand
                    </button>
                    <button
                        className={`ext-btn ${extMode === "forward" ? "active" : ""}`}
                        onClick={() => setExtMode("forward")}
                    >
                        Extend Fwd (x4) →
                    </button>
                </div>

                {/* Row 3: Enharmonic & Game Mode */}
                <div className="control-group">
                    <button
                        className="mode-toggle"
                        onClick={() =>
                            setAccidental((prev) => (prev === "sharp" ? "flat" : "sharp"))
                        }
                    >
                        {accidental === "sharp" ? "Sharps (♯)" : "Flats (♭)"}
                    </button>

                    <button
                        className={`mode-toggle ${mode === "quiz" ? "btn-primary" : ""}`}
                        onClick={() => setMode((prev) => (prev === "explore" ? "quiz" : "explore"))}
                    >
                        {mode === "explore" ? "Start Quiz" : "Stop Quiz"}
                    </button>
                </div>
            </div>

            <div className="quiz-feedback">{message}</div>

            <div className="fingerboard-wrapper">
                {/* Render 4 Strings */}
                {(["C", "G", "D", "A"] as StringName[]).map((stringName) => (
                    <div key={stringName} className="string-column">
                        <div className="string-name">{stringName}</div>
                        <div className="string-line"></div>

                        {/* Render Finger Slots based on Extension Mode */}
                        {getFingerOffsets(extMode).map((offset, index) => {
                            const { name, frequency } = getNoteInfo(
                                stringName,
                                offset,
                                position.startSemitone,
                                accidental,
                            );
                            const uniqueId = `${stringName}-${offset}`;

                            // Visual State Logic
                            let status: "idle" | "correct" | "wrong" = "idle";
                            // Simple correct/wrong visual flash could be added here based on recent clicks

                            return (
                                <div key={uniqueId} className={getShiftClass(index)}>
                                    <NoteNode
                                        noteName={name}
                                        finger={index + 1} // Visual finger number (1,2,3,4)
                                        isRevealed={revealedNotes.has(uniqueId)}
                                        quizStatus={status}
                                        onClick={() =>
                                            handleNoteClick(stringName, offset, name, frequency)
                                        }
                                    />
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;
