import { LoadingSpinner } from "@/components/loading-spinner";

export default function UploadLoading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <LoadingSpinner size="lg" text="Loading upload page..." className="py-20" />
    </div>
  );
}