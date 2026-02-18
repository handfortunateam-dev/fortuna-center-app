export interface ILesson {
    id: string;
    title: string;
    description: string | null;
    classId: string;
    className: string | null;
    classCode: string | null;
    order: number;
    publishedAt: string | null;
    materialCount: number;
    createdAt: string;
    updatedAt: string;
}
