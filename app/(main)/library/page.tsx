import Link from "next/link";
import Image from "next/image";

interface Category {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

const CATEGORIES: Category[] = [
  {
    slug: "programming",
    title: "Programação",
    description: "Linguagens, frameworks, algoritmos e mais.",
    icon: "/todo-list.png",
  },
  {
    slug: "neuroscience",
    title: "Neurociência",
    description: "Entenda como o cérebro funciona.",
    icon: "/brain.png",
  },
];

export const dynamic = "force-dynamic";

export default function LibraryPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-extrabold mb-6">Biblioteca Digital</h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/library/${cat.slug}`}
            className="rounded-xl border hover:shadow-lg transition p-5 flex flex-col gap-3 backdrop-blur-sm bg-white/60"
          >
            <Image src={cat.icon} alt={cat.title} width={64} height={64} className="self-center" />
            <h2 className="font-bold text-lg text-center">{cat.title}</h2>
            <p className="text-sm text-center text-neutral-600">{cat.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
} 