import { cn } from "~/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function VerifiedBadge({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Tooltip delayDuration={250}>
      <TooltipTrigger>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={cn(
            "fill-primary",
            size === "sm" ? "h-4 w-4" : size === "md" ? "h-6 w-6" : "h-8 w-8",
          )}
        >
          <path d="M19.965 8.521C19.988 8.347 20 8.173 20 8c0-2.379-2.143-4.288-4.521-3.965C14.786 2.802 13.466 2 12 2s-2.786.802-3.479 2.035C6.138 3.712 4 5.621 4 8c0 .173.012.347.035.521C2.802 9.215 2 10.535 2 12s.802 2.785 2.035 3.479A3.976 3.976 0 0 0 4 16c0 2.379 2.138 4.283 4.521 3.965C9.214 21.198 10.534 22 12 22s2.786-.802 3.479-2.035C17.857 20.283 20 18.379 20 16c0-.173-.012-.347-.035-.521C21.198 14.785 22 13.465 22 12s-.802-2.785-2.035-3.479zm-9.01 7.895-3.667-3.714 1.424-1.404 2.257 2.286 4.327-4.294 1.408 1.42-5.749 5.706z"></path>
        </svg>

        {/* <BadgeCheck
          className={cn(
            "text-primary",
            size === "sm" ? "h-4 w-4" : size === "md" ? "h-6 w-6" : "h-8 w-8",
          )}
        /> */}
        {/* <Image src="/logo.png" alt="Logo" width={32} height={32} /> */}
      </TooltipTrigger>
      <TooltipContent>Kabsu.me Verified</TooltipContent>
    </Tooltip>
  );
}
