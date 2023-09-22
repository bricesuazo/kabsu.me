import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function VerifiedBadge() {
  return (
    <Tooltip delayDuration={250}>
      <TooltipTrigger>
        <Image src="/logo.png" alt="Logo" width={32} height={32} />
      </TooltipTrigger>
      <TooltipContent>CvSU.me Verified</TooltipContent>
    </Tooltip>
  );
}
