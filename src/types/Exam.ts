export interface Exam {
    id: string;
    title: string;
    startDate: string;
    dueDate: string;
    subjectId: string;
    createdAt: string;
}
export interface ExamTabProps {
    id?: string;
    subject: any;
    classroom: any;
  }