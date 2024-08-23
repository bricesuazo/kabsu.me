import { Loader2 } from "lucide-react";

export default function NGLLoading() {
  return (
    <div className="grid h-full place-items-center">
      <Loader2 className="animate-spin" />
    </div>
  );
}
