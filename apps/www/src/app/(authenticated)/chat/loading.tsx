import { Icons } from "~/components/icons";

export default function ChatLoading() {
  return (
    <div className="grid place-items-center p-10">
      <Icons.spinner className="animate-spin" />
    </div>
  );
}
