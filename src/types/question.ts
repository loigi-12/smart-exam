export type Question =
    | {
            id: string;
            type: "multiple-choice";
            question: string;
            options: string[];
            correctAnswer: string;
        }
    | {
            id: string;
            type: "identification";
            question: string;
            correctAnswer: string;
        }
    | {
            id: string;
            type: "essay";
            question: string;
            correctAnswer: string;
            expectedWordCount: number;
            essayScore: number;
        };