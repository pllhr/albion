import { useKey, useMedia } from "react-use";
import { XCircle } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  onSkip?: () => void;
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  showSkip?: boolean;
  lessonId?: number;
};

export const Footer = ({
  onCheck,
  onSkip,
  status,
  disabled,
  lessonId,
  showSkip = false,
}: Props) => {
  useKey("Enter", onCheck, {}, [onCheck]);
  const isMobile = useMedia("(max-width: 1024px)");

  const heightClass = status === "none" ? "lg:h-[100px] h-[80px]" : "lg:h-[160px] h-[120px]";

  return (
    <footer className={cn(
      "fixed bottom-0 left-0 w-full bg-white border-t-2",
      heightClass,
      status === "correct" && "border-transparent bg-green-100",
      status === "wrong" && "border-transparent bg-rose-100",
    )}>
      <div className="max-w-[1140px] h-full mx-auto flex items-center justify-between px-6 lg:px-10">
        {status === "correct" && (
          <div className="flex items-center gap-4">
            <Image src="/original2.png" alt="Sucesso" height={80} width={80} />
            <span className="text-green-600 font-bold text-base lg:text-3xl">Excelente!</span>
          </div>
        )}
        {status === "wrong" && (
          <div className="text-rose-500 font-bold text-base lg:text-2xl flex items-center">
            <XCircle className="h-6 w-6 lg:h-10 lg:w-10 mr-4" />
            Tente novamente.
          </div>
        )}
        {status === "completed" && (
          <Button
            variant="default"
            size={isMobile ? "sm" : "lg"}
            onClick={() => window.location.href = `/lesson/${lessonId}`}
          >
            Pratique novamente
          </Button>
        )}
        {showSkip && status === "none" && onSkip && (
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "lg"}
            onClick={onSkip}
            className="mr-auto"
          >
            Pular
          </Button>
        )}
        <Button
          disabled={disabled}
          className="ml-auto"
          onClick={onCheck}
          size={isMobile ? "sm" : "lg"}
          variant={status === "wrong" ? "danger" : "secondary"}
        >
          {status === "none" && "Check"}
          {status === "correct" && "Next"}
          {status === "wrong" && "Retry"}
          {status === "completed" && "Continue"}
        </Button>
      </div>
    </footer>
  );
};
