import Header from "./header";
import PostForm from "./post-form";
import PostTypeTab from "./post-type-tab";
import Posts from "./posts";

export default function HomeProtected({
  tab,
}: {
  tab?: "all" | "campus" | "program" | "college";
}) {
  const TABS_TITLE = {
    all: "See posts of all campuses.",
    campus: "See posts of your campus.",
    college: "See posts of your college.",
    program: "See posts of your program.",
  };

  return (
    <div className="border-x">
      <div className="sticky top-0 z-50 backdrop-blur-lg">
        <Header />

        <PostTypeTab />
      </div>

      <div className="border-b p-3 text-center sm:hidden">
        <p className="text-sm capitalize text-primary">
          {tab ? tab : "following"} tab
        </p>
        <p className="text-xs text-muted-foreground">
          {tab ? TABS_TITLE[tab] : "See posts of who you are following."}
        </p>
      </div>

      <div className="min-h-screen">
        <PostForm hasRedirect />

        <Posts tab={!tab ? "following" : tab} />
      </div>
    </div>
  );
}
