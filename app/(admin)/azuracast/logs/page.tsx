import { AzuraLogFile } from "@/services/azurecast/interfaces";
import { getLogFiles } from "@/services/azurecast/azuracastPrivateService";
import LogListClient from "./LogListClient";

export default async function AzuracastLogsPage() {
  let logFiles: AzuraLogFile[] = [];
  let error: string | null = null;

  try {
    logFiles = await getLogFiles();
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "Gagal memuat daftar log dari AzuraCast.";
  }

  return <LogListClient logs={logFiles} error={error} />;
}
