import { LoadingSpinner } from "@/components/loading-spinner";

export default function VideoLoading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <LoadingSpinner size="lg" text="Loading video data..." className="py-20" />
    </div>
  );
}