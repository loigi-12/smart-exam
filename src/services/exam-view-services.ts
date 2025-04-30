import { ref, onValue, set, get  } from "firebase/database";
import { database } from "@/lib/firebase";

export const getExamQuestions = async (examId: string) => {
    const examRef = ref(database, `exams/${examId}`);
    const snapshot = await get(examRef);
    
    if (snapshot.exists()) {
      const examData = snapshot.val();
      return examData.questions || [];
    } else {
      throw new Error("Exam not found");
    }
};

export const feedbackExam = async (examId: string, userExamId: string, feedback: string) => {
    try {
        const feedbackRef = ref(database, `userExams/${examId}/users/${userExamId}/feedback`);
        await set(feedbackRef, feedback);
        return true;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error submitting feedback:", error.message);
        } else {
            console.error("Unknown error:", error);
        }
        throw error;
    }
}

export const getFeedback = (
    examId: string,
    userExamId: string,
    callback: (feedback: string | null) => void
) => {
    const feedbackRef = ref(database, `userExams/${examId}/users/${userExamId}/feedback`);
    return onValue(feedbackRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        } else {
            callback(null);
        }
    });
}; 
