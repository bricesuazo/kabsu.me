"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
// import UpdatePost from "./update-post";
import {
  Album,
  Briefcase,
  GraduationCap,
  Heart,
  MessageCircle,
} from "lucide-react";
import { v4 as uuid } from "uuid";

import type { RouterOutputs } from "@kabsu.me/api";

import { api } from "~/lib/trpc/client";
import { cn, FormattedContent, FormattedContentTextOnly } from "~/lib/utils";
import { ImagesViewer } from "./images-viewer";
import PostDropdown from "./post-dropdown";
import PostShare from "./post-share";
import { PostSkeletonNoRandom } from "./post-skeleton";
import { Badge } from "./ui/badge";
import { Toggle } from "./ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import VerifiedBadge from "./verified-badge";

export default function Post({
  post,
}: {
  post: RouterOutputs["posts"]["getPosts"]["posts"][number];
}) {
  const [openImagesViewer, setOpenImagesViewer] = useState(false);
  const [scrollTo, setScrollTo] = useState(0);
  const getPostQuery = api.posts.getPost.useQuery({ post_id: post.id });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [likes, setLikes] = useState<
    RouterOutputs["posts"]["getPost"]["post"]["likes"]
  >(getPostQuery.data?.post.likes ?? []);

  const unlikeMutation = api.posts.unlike.useMutation({
    onMutate: ({ userId }) => {
      setLikes((prev) =>
        prev.filter(
          (like) => like.post_id !== post.id || like.user_id !== userId,
        ),
      );
    },
    onSuccess: ({ like, userId }) => {
      setLikes((prev) =>
        prev.filter((l) => l.post_id !== like.post_id || l.user_id !== userId),
      );
    },
  });
  const likeMutation = api.posts.like.useMutation({
    onMutate: ({ post_id, userId }) => {
      setLikes((prev) => [
        ...prev,
        {
          id: uuid(),
          post_id,
          user_id: userId,
          created_at: new Date().toISOString(),
        },
      ]);
    },
    onSuccess: ({ like, userId }) => {
      setLikes((prev) => [
        ...prev.filter(
          (l) => l.post_id !== like.post_id || l.user_id !== userId,
        ),
        like,
      ]);
    },
  });

  useEffect(() => {
    if (getPostQuery.data) {
      setLikes(getPostQuery.data.post.likes);
    }
  }, [getPostQuery.data]);

  if (!getPostQuery.data) return <PostSkeletonNoRandom />;

  return (
    <>
      <ImagesViewer
        open={openImagesViewer}
        setOpen={setOpenImagesViewer}
        images={getPostQuery.data.post.posts_images.map((image) => ({
          id: image.id,
          url: image.signed_url,
        }))}
        scrollTo={scrollTo}
      />
      <div
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/${getPostQuery.data.post.user.username}/${post.id}`, {
            scroll: true,
          });
        }}
        className="cursor-pointer space-y-2 border-b p-4"
      >
        <div className="flex justify-between">
          <Link
            href={`/${getPostQuery.data.post.user.username}`}
            onClick={(e) => e.stopPropagation()}
            className="flex gap-x-2"
          >
            <div className="w-max">
              <Image
                src={
                  getPostQuery.data.post.user.image_name
                    ? getPostQuery.data.post.user.image_url
                    : "/default-avatar.jpg"
                }
                alt={`${getPostQuery.data.post.user.name} profile picture`}
                width={40}
                height={40}
                className="aspect-square rounded-full object-cover object-center"
              />
            </div>
            <div className="flex flex-1 flex-col gap-y-1">
              <div className="group flex items-center gap-x-2">
                {/* <p className="line-clamp-1 group-hover:underline">
                    {post.user.firstName} {post.user.lastName}{" "}
                  </p> */}
                <div className="flex items-center gap-x-1">
                  <p className="text-md line-clamp-1 flex-1 break-all font-medium hover:underline">
                    @{getPostQuery.data.post.user.username}
                  </p>

                  {getPostQuery.data.post.user.verified_at && (
                    <VerifiedBadge size="sm" />
                  )}
                </div>

                <p className="pointer-events-none select-none">·</p>

                <Tooltip delayDuration={250}>
                  <TooltipTrigger>
                    <p className="hidden text-xs text-muted-foreground hover:underline xs:block">
                      {formatDistanceToNow(getPostQuery.data.post.created_at, {
                        includeSeconds: true,
                        addSuffix: true,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground hover:underline xs:hidden">
                      {formatDistanceToNow(getPostQuery.data.post.created_at, {
                        includeSeconds: true,
                        addSuffix: true,
                      })}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    {format(getPostQuery.data.post.created_at, "PPpp")}
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-x-1">
                <Tooltip delayDuration={250}>
                  <TooltipTrigger>
                    {(() => {
                      switch (getPostQuery.data.post.user.type) {
                        case "student":
                          return <Album />;
                        case "alumni":
                          return <GraduationCap />;
                        case "faculty":
                          return <Briefcase />;
                        default:
                          return null;
                      }
                    })()}
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[12rem]">
                    {getPostQuery.data.post.user.type.charAt(0).toUpperCase() +
                      getPostQuery.data.post.user.type.slice(1)}
                  </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={250}>
                  <TooltipTrigger>
                    <Badge>
                      {searchParams.get("tab") === "college"
                        ? getPostQuery.data.post.user.programs?.colleges?.slug.toUpperCase()
                        : getPostQuery.data.post.user.programs?.colleges?.campuses?.slug.toUpperCase()}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[12rem]">
                    {searchParams.get("tab") === "college"
                      ? getPostQuery.data.post.user.programs?.colleges?.name
                      : getPostQuery.data.post.user.programs?.colleges?.campuses
                          ?.name}
                  </TooltipContent>
                </Tooltip>

                <Tooltip delayDuration={250}>
                  <TooltipTrigger>
                    <Badge variant="outline">
                      {getPostQuery.data.post.user.programs?.slug.toUpperCase()}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[12rem]">
                    {getPostQuery.data.post.user.programs?.name}
                  </TooltipContent>
                </Tooltip>
              </div>
              {/* <p className="line-clamp-1 flex-1 break-all text-sm">
                  @{getPostQuery.data.post.user.username}
                </p> */}
            </div>
          </Link>

          <PostDropdown
            post_id={post.id}
            isMyPost={
              getPostQuery.data.post.user_id === getPostQuery.data.userId
            }
          />
        </div>

        <div className="whitespace-pre-wrap break-words">
          <FormattedContent
            text={getPostQuery.data.post.content}
            mentioned_users={getPostQuery.data.mentioned_users}
          />
        </div>

        {getPostQuery.data.post.posts_images.length > 0 && (
          <div
            className={cn(
              "grid grid-cols-3 gap-2",
              getPostQuery.data.post.posts_images.length === 1 && "grid-cols-1",
              getPostQuery.data.post.posts_images.length === 2 && "grid-cols-2",
              getPostQuery.data.post.posts_images.length > 3 && "grid-cols-3",
            )}
          >
            {getPostQuery.data.post.posts_images.map((image, index) => (
              <button
                key={image.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenImagesViewer(true);
                  setScrollTo(index);
                }}
                className="w-fit"
              >
                <Image
                  src={image.signed_url}
                  alt={image.name}
                  width={400}
                  height={400}
                  className="aspect-square rounded-lg object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex gap-x-1">
            <Toggle
              size="sm"
              pressed={likes.some(
                (like) =>
                  like.user_id === getPostQuery.data.userId &&
                  like.post_id === post.id,
              )}
              onClick={(e) => e.stopPropagation()}
              onPressedChange={(pressed) => {
                if (pressed) {
                  likeMutation.mutate({
                    post_id: post.id,
                    userId: getPostQuery.data.userId,
                  });
                } else {
                  unlikeMutation.mutate({
                    post_id: post.id,
                    userId: getPostQuery.data.userId,
                  });
                }
              }}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  likes.some(
                    (like) =>
                      like.user_id === getPostQuery.data.userId &&
                      like.post_id === post.id,
                  ) && "fill-primary text-primary",
                )}
              />
            </Toggle>

            <Toggle
              size="sm"
              pressed={false}
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href={`/${getPostQuery.data.post.user.username}/${post.id}?comment`}
              >
                <MessageCircle className="h-4 w-4" />
              </Link>
            </Toggle>

            <div onClick={(e) => e.stopPropagation()}>
              <PostShare
                data={{
                  image: getPostQuery.data.post.user.image_name
                    ? getPostQuery.data.post.user.image_url
                    : "",
                  username: getPostQuery.data.post.user.username,
                  name: getPostQuery.data.post.user.name,
                  content: FormattedContentTextOnly({
                    text: getPostQuery.data.post.content,
                    mentioned_users: getPostQuery.data.mentioned_users,
                  }),
                  likes: likes.length.toString(),
                  comments: getPostQuery.data.post.comments.length.toString(),
                  privacy: getPostQuery.data.post.type,
                  campus:
                    getPostQuery.data.post.user.programs?.colleges?.campuses
                      ?.slug ?? "",
                  program: getPostQuery.data.post.user.programs?.slug ?? "",
                  verified: !!getPostQuery.data.post.user.verified_at,
                  images: getPostQuery.data.post.posts_images.map(
                    (image) => image.signed_url,
                  ),
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-x-4">
            <p className="text-sm text-muted-foreground">
              {`${likes.length} like${likes.length > 1 ? "s" : ""} — ${
                getPostQuery.data.post.comments.length
              } comment${getPostQuery.data.post.comments.length > 1 ? "s" : ""}`}
            </p>
            <Badge variant="outline" className="flex items-center gap-x-1">
              <p className="hidden xs:block">Privacy:</p>
              {getPostQuery.data.post.type === "following"
                ? "Follower"
                : getPostQuery.data.post.type.charAt(0).toUpperCase() +
                  getPostQuery.data.post.type.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
}
