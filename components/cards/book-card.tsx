"use client";

import { useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Bookmark, Heart } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  toggleLikeBook,
  toggleSaveBook,
} from "@/actions/user-interactions";

type Props = {
  id: number;
  title: string;
  pdfSrc: string | null;
  imageSrc: string;
  isLiked: boolean;
  isSaved: boolean;
  disabled: boolean;
};

export const BookCard = ({
  id,
  title,
  pdfSrc,
  imageSrc,
  isLiked,
  isSaved,
  disabled,
}: Props) => {
  const [pending, startTransition] = useTransition();

  const onLike = () => {
    if (disabled || pending) return;
    startTransition(() => {
      toggleLikeBook(id)
        .then(() => toast.success(isLiked ? "Unliked book" : "Liked book"))
        .catch(() => toast.error("Something went wrong."));
    });
  };

  const onSave = () => {
    if (disabled || pending) return;
    startTransition(() => {
      toggleSaveBook(id)
        .then(() => toast.success(isSaved ? "Unsaved book" : "Saved book"))
        .catch(() => toast.error("Something went wrong."));
    });
  };

  return (
    <Link href={`/reading/book/${id}/0`}>
      <div className="group flex flex-col h-full border-2 rounded-xl border-b-4 bg-white hover:bg-white shadow-sm hover:shadow-lg cursor-pointer active:border-b-2 p-3 transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-video border-b-2 w-full mb-3">
        <Image src={imageSrc} alt={title} fill className="object-contain rounded-lg"/>
      </div>
      <div className="flex flex-col items-center justify-between pt-3 w-full grow">
        <p className="text-neutral-700 text-center font-bold truncate mb-3">
          {title}
        </p>
        <div className="flex items-center justify-end w-full mt-auto">
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onSave}
            disabled={pending || disabled}
            className="mr-2 p-1 rounded-full transition-colors disabled:opacity-50 focus:outline-none"
            style={{ background: isSaved ? "#fff7ed" : "transparent" }}
          >
            <Bookmark
              className={`h-6 w-6 transition-colors ${
                isSaved ? "fill-orange-500 text-orange-500" : "text-neutral-400 group-hover:text-orange-500"
              }`}
            />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLike}
            disabled={pending || disabled}
            className="p-1 rounded-full transition-colors disabled:opacity-50 focus:outline-none"
            style={{ background: isLiked ? "#fee2e2" : "transparent" }}
          >
            <Heart
              className={`h-6 w-6 transition-colors ${
                isLiked ? "fill-red-500 text-red-500" : "text-neutral-400 group-hover:text-red-500"
              }`}
            />
          </motion.button>
        </div>
      </div>
    </div>
    </Link>
  );
};
