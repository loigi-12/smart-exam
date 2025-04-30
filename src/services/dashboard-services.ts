import { ref, onValue, } from "firebase/database";
import { database } from "@/lib/firebase";

// header admin
export const getTotalUsers = (callback: (counts: {
    total: number;
    students: number;
    professors: number;
  }) => void) => {
      try {
        const usersRef = ref(database, 'users');
        
        const unsubscribe = onValue(usersRef, (snapshot) => {
          if (snapshot.exists()) {
            let studentCount = 0;
            let professorCount = 0;
            
            snapshot.forEach((childSnapshot) => {
              const user = childSnapshot.val();
              if (user.role === 'student') {
                studentCount++;
              } else if (user.role === 'professor') {
                professorCount++;
              }
            });
  
            callback({
              total: snapshot.size,
              students: studentCount,
              professors: professorCount
            });
          } else {
            callback({
              total: 0,
              students: 0,
              professors: 0
            });
          }
        });
  
        return unsubscribe;
      } catch (error) {
        console.error('Error setting up user listener:', error);
        throw error;
      }
  };

export const getTotalDepartments = (callback: (departmentCount: number) => void) => {
    try {
      const departmentsRef = ref(database, 'departments');
      
      const unsubscribe = onValue(departmentsRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.size);
        } else {
          callback(0);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up department listener:', error);
      throw error;
    }
};

export const getTotalSubjects = (callback: (subjectCount: number) => void) => {
    try {
      const subjectsRef = ref(database, 'subjects');
      
      const unsubscribe = onValue(subjectsRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.size);
        } else {
          callback(0);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up subjects listener:', error);
      throw error;
    }
};

export const getTotalClassrooms = (callback: (classroomCount: number) => void) => {
    try {
      const classroomRef = ref(database, 'classrooms');
      
      const unsubscribe = onValue(classroomRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.size);
        } else {
          callback(0);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up classroom listener:', error);
      throw error;
    }
};

// header professor
export const getClassroomsByProfessor = (
    professorId: string,
    callback: (data: { classroomCount: number; studentCount: number }) => void
  ) => {
    try {
      const classroomRef = ref(database, 'users');
      
      const unsubscribe = onValue(classroomRef, (snapshot) => {
        if (snapshot.exists()) {
          let classroomCount = 0;
          let studentCount = 0;
          
          snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            
            // Check if this is the professor we're looking for
            if (user.role === 'professor' && childSnapshot.key === professorId && user.subjects) {
              classroomCount = user.subjects.length;
            }
            
            // Count students who have matching subjects
            if (user.role === 'student' && user.subjects) {
              studentCount += user.subjects.length;
            }
          });
          callback({ classroomCount, studentCount });
        } else {
          callback({ classroomCount: 0, studentCount: 0 });
        }
      });
  
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up professor classroom listener:', error);
      throw error;
    }
};


export const getExamsByProfessorSubjects = (
    professorId: string,
    callback: (examCount: number) => void
  ) => {
    try {
      const classroomRef = ref(database, 'classrooms');
      const examsRef = ref(database, 'exams');
      
      const unsubscribeClassrooms = onValue(classroomRef, (classroomSnapshot) => {
        if (classroomSnapshot.exists()) {
          const subjectIds = new Set<string>();
          
          classroomSnapshot.forEach((childSnapshot) => {
            const classroom = childSnapshot.val();
            if (classroom.createdBy === professorId && classroom.subjects) {
              classroom.subjects.forEach((subject: string) => {
                subjectIds.add(subject);
              });
            }
          });
  
          const unsubscribeExams = onValue(examsRef, (examSnapshot) => {
            if (examSnapshot.exists()) {
              let examCount = 0;
              
              examSnapshot.forEach((childSnapshot) => {
                const exam = childSnapshot.val();
                if (subjectIds.has(exam.subjectId)) {
                  examCount++;
                }
              });
              
              callback(examCount);
            } else {
              callback(0);
            }
          });
  
          return () => {
            unsubscribeExams();
          };
        } else {
          callback(0);
        }
      });
  
      return unsubscribeClassrooms;
    } catch (error) {
      console.error('Error setting up exam listener:', error);
      throw error;
    }
};


export const getLatestActivities = (
  userId: string,
  userRole: string,
  callback: (activities: Array<{
      examId: string;
      subjectId: string;
      title: string;
      date: string;
      status: 'active' | 'expired' | 'almost-due';
  }>) => void
) => {
  try {
    const usersRef = ref(database, 'users');
    const examsRef = ref(database, 'exams');
    
    const unsubscribeUsers = onValue(usersRef, (userSnapshot) => {
        if (userSnapshot.exists()) {
            const subjectIds = new Set<string>();
            const classroomIds = new Set<string>();
            
            userSnapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                if (childSnapshot.key === userId) {
                    if (user.subjects) {
                        user.subjects.forEach((subject: string) => {
                            subjectIds.add(subject);
                        });
                    }
                    if (user.classrooms) {
                        user.classrooms.forEach((classroom: string) => {
                            classroomIds.add(classroom);
                        });
                    }
                }
            });
              

              const unsubscribeExams = onValue(examsRef, (examSnapshot) => {
                  if (examSnapshot.exists()) {
                      const activities: Array<{
                          examId: string;
                          subjectId: string;
                          title: string;
                          date: string;
                          status: 'active' | 'expired' | 'almost-due';
                      }> = [];
                      
                      const now = new Date();
                      
                      examSnapshot.forEach((childSnapshot) => {
                          const exam = childSnapshot.val();
                          
                          if (userRole === 'admin' || subjectIds.has(exam.subjectId)) {
                              const dueDate = exam.dueDate ? new Date(exam.dueDate) : null;
                              let status: 'active' | 'expired' | 'almost-due' = 'active';
                              let formattedDate = 'No date specified';
                              
                              if (dueDate) {
                                  // Calculate time difference in hours
                                  const timeDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                                  
                                  if (timeDiff < 0) {
                                      status = 'expired';
                                  } else if (timeDiff <= 24) {
                                      status = 'almost-due';
                                  }
                                  
                                  formattedDate = dueDate.toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                  });
                              }
                              
                              activities.push({
                                  examId: childSnapshot.key,
                                  subjectId: exam.subjectId,
                                  title: exam.name,
                                  date: formattedDate,
                                  status: status
                              });
                          }
                      });
                      
                      callback(activities);
                  } else {
                      callback([]);
                  }
              });

              return () => {
                  unsubscribeExams();
              };
          } else {
              callback([]);
          }
      });

      return unsubscribeUsers;
  } catch (error) {
      console.error('Error setting up latest activities listener:', error);
      throw error;
  }
};