// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SuggestionDataItem } from "react-mentions";

declare module "react-mentions" {
  interface SuggestionDataItem {
    id: string | number;
    display?: {
      username: string;
      id: string;
    };
    // Additional types
    is_verified: boolean;
    name: string;
    image_url: string | undefined;
    image_name: string | undefined;
  }
}
