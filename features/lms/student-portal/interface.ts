export interface IStudentAssignmentDetail {
    id: string;
    title: string;
    description: string | null;
    instructions: string | null;
    maxScore: number;
    dueDate: string | null;
    status: 'draft' | 'published' | 'closed';
    classId: string;
    teacherId: string;
    teacherName: string;
    attachments: { url: string; type: 'image' | 'video' | 'document' | 'audio'; name: string }[];
    submission?: {
        id: string;
        content: string | null;
        attachments: { url: string; type: 'image' | 'video' | 'document' | 'audio'; name: string }[];
        status: 'pending' | 'submitted' | 'graded';
        score: number | null;
        feedback: string | null;
        submittedAt: string | null;
        gradedAt: string | null;
    } | null;
}

export interface StudentSubmissionFormValues {
    content: string;
    attachments?: { file?: File; url: string; type: "image" | "video" | "document" | "audio"; name: string }[];
}
