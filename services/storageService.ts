
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";

export const uploadFileToFirebase = async (
    file: File,
    folder: string = "uploads"
): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const uniqueName = `${Date.now()}_${uuidv4()}_${file.name}`;
            const storageRef = ref(storage, `${folder}/${uniqueName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // You could implement a progress callback here if needed
                },
                (error) => {
                    reject(error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (err) {
                        reject(err);
                    }
                }
            );
        } catch (error) {
            reject(error);
        }
    });
};
