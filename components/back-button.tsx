"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function BackButton({
  href,
  onClick,
  className = "",
  children = "Back to Dashboard"
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  if (href) {
    return (
      <Link href={href}>
        <Button
          variant="outline"
          className={`rounded-full border-white/20 text-white hover:bg-white/10 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${className}`}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          {children}
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={`rounded-full border-white/20 text-white hover:bg-white/10 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${className}`}
    >
      <ArrowLeft className="mr-2 w-4 h-4" />
      {children}
    </Button>
  );
}