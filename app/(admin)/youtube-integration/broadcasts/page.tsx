import YouTubeBroadcastList from "@/components/admin/youtube/YouTubeBroadcastList";

export default function YouTubeBroadcastsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Live Broadcasts</h1>
      <YouTubeBroadcastList />
    </div>
  );
}
