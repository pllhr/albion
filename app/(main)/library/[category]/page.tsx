import { auth } from "@clerk/nextjs/server";

import { BookCard } from "@/components/cards/book-card";
import {
  getBooks,
  getUserBookLikes,
  getUserBookSaves,
} from "@/db/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: { category: string };
};

export default async function CategoryPage({ params }: Props) {
  const { userId } = auth();

  const [books, userBookLikes, userBookSaves] = await Promise.all([
    getBooks(params.category),
    getUserBookLikes(userId),
    getUserBookSaves(userId),
  ]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-extrabold capitalize mb-4">
        {decodeURIComponent(params.category)}
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {books.map((book) => (
          <BookCard
            key={book.id}
            id={book.id}
            title={book.title}
            imageSrc={book.imageSrc}
            pdfSrc={book.pdfSrc}
            isLiked={userBookLikes.some((like) => like.bookId === book.id)}
            isSaved={userBookSaves.some((save) => save.bookId === book.id)}
            disabled={!userId}
          />
        ))}
      </div>
    </div>
  );
}