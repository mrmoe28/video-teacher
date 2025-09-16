import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  error: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  error, 
  onDismiss, 
  className = "" 
}: ErrorMessageProps) {
  return (
    <div className={`p-3 bg-red-500/10 border border-red-500/20 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-auto"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}