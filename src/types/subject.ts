export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  block: string;
  classroomId?: string[];
  createdBy: string;
  inviteCode: string;
  [key: string]: any;
}
