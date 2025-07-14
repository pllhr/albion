"use client";

import { useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Heart, Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  toggleLikeStory,
  toggleSaveStory,
} from "@/actions/user-interactions";

type Props = {
  id: number;
  title: string;
  imageSrc: string;
  isLiked: boolean;
  isSaved: boolean;
  disabled: boolean;
  slug: string;
};

export const StoryCard = ({
  id,
  title,
  imageSrc,
  isLiked,
  isSaved,
  disabled,
  slug
}: Props) => {
  const [pending, startTransition] = useTransition();

  const onLike = () => {
    if (disabled || pending) return;
    startTransition(() => {
      toggleLikeStory(id)
        .then(() => toast.success(isLiked ? "Unliked story" : "Liked story"))
        .catch(() => toast.error("Something went wrong."));
    });
  };

  const onSave = () => {
    if (disabled || pending) return;
    startTransition(() => {
      toggleSaveStory(id)
        .then(() => toast.success(isSaved ? "Unsaved story" : "Saved story"))
        .catch(() => toast.error("Something went wrong."));
    });
  };

  const onClick = () => {
    window.location.href = `/reading/${slug}`;
  }

  return (
    <div className="flex flex-col h-full border-2 rounded-xl border-b-4 hover:bg-black/5 active:border-b-2 p-3">
      <div
        onClick={onClick}
        className="relative aspect-video border-b-2 w-full mb-3 cursor-pointer"
      >
        <Image src={imageSrc} alt={title} fill className="rounded-lg object-cover"/>
      </div>
      <div className="flex flex-col items-center justify-between pt-3 w-full grow">
        <p className="text-neutral-700 text-center font-bold truncate mb-3">
          {title}
        </p>
        <div className="flex items-center justify-end w-full mt-auto">
          <Button
            onClick={onSave}
            disabled={pending || disabled}
            size="sm"
            variant="ghost"
            className="mr-2"
          >
            <Bookmark
              className={`h-5 w-5 ${
                isSaved ? "fill-yellow-400 text-yellow-400" : "text-neutral-400"
              }`}
            />
          </Button>
          <Button
            onClick={onLike}
            disabled={pending || disabled}
            size="sm"
            variant="ghost"
          >
            <Heart
              className={`h-5 w-5 ${
                isLiked ? "fill-red-500 text-red-500" : "text-neutral-400"
              }`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};
