import React from "react";

interface NoteNodeProps {
    noteName: string;
    finger: number;
    isRevealed: boolean;
    quizStatus: "idle" | "correct" | "wrong";
    onClick: () => void;
}

export const NoteNode: React.FC<NoteNodeProps> = ({
    noteName,
    isRevealed,
    quizStatus,
    onClick,
}) => {
    let className = "note-node";
    let content = "";

    if (quizStatus === "correct") {
        className += " correct";
        content = noteName;
    } else if (quizStatus === "wrong") {
        className += " wrong";
        content = "X";
    } else if (isRevealed) {
        className += " revealed";
        content = noteName;
    }

    return (
        <div className={className} onClick={onClick}>
            {content}
        </div>
    );
};
