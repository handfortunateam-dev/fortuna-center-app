import { redirect } from "next/navigation";

export default function VideoGalleryRootPage() {
  // Redirect /video-gallery to the first child /video-gallery/videos
  redirect("/video-gallery/videos");
}
