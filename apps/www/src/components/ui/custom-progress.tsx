import { cn } from "@/lib/utils";

interface pageProps {
  className?: string;
  value?: number;
  hitLimit?: boolean;
}

const CustomProgress = ({ className, value, hitLimit }: pageProps) => {
  return (
    <div
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className,
      )}
    >
      <div
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all",
          hitLimit && "bg-red-500",
        )}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </div>
  );
};

export default CustomProgress;
