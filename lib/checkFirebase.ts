import { app, storage } from "./firebase";
import { ref, listAll } from "firebase/storage";

export const checkFirebaseConnection = async () => {
    console.log("🔎 Checking Firebase configuration...");

    const config = app.options;
    const checks = {
        projectId: !!config.projectId && config.projectId.trim() !== "" && !config.projectId.includes(" "),
        apiKey: !!config.apiKey,
        authDomain: !!config.authDomain,
        storageBucket: !!config.storageBucket,
    };

    console.log("Configuration status:", checks);

    if (!checks.projectId) {
        console.error("❌ Invalid Project ID. It seems empty or contains spaces.");
        return;
    }

    if (config.projectId?.startsWith(" ")) {
        console.warn("⚠️ Warning: Project ID starts with a space. This might be a mistake.");
    }

    console.log(`🌍 Connecting to project: ${config.projectId}`);

    try {
        // Try to access storage. 
        // Even without auth, this should reach the server and return an error (permission denied) 
        // or success (if public), proving connectivity.
        const testRef = ref(storage, "test-connectivity");

        console.log("Attempting to list files (to verify connection)...");
        await listAll(testRef);

        console.log("✅ Firebase connection established! (Public access allowed or authenticated)");
    } catch (error: any) {
        if (error.code === 'storage/unauthorized') {
            console.log("✅ Firebase connection established! (Permission Denied - Expected for unauthenticated client)");
            console.log("   This confirms the app can reach Firebase services.");
        } else if (error.code === 'storage/object-not-found') {
            console.log("✅ Firebase connection established! (Object not found)");
        } else {
            console.error("❌ Connection failed:", error.code, error.message);
            if (error.code === 'auth/network-request-failed') {
                console.error("   Check your internet connection.");
            }
        }
    }
};
