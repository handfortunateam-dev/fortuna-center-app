import { ITeacher } from "@/features/lms/teachers/interface";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

export const useTeachers = (params?: any) => {
    return useQuery<{ data: ITeacher[] }>({
        queryKey: ["teachers", params],
        queryFn: async () => {
            const { data } = await axios.get("/teachers", { params });
            return data;
        },
    });
};

export const useTeacherDetail = (id: string) => {
    return useQuery<{ data: ITeacher }>({
        queryKey: ["teacher", id],
        queryFn: async () => {
            const { data } = await axios.get(`/teachers/${id}`);
            return data;
        },
        enabled: !!id,
    });
};
