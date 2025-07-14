import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { courses, units, lessons } from "@/db/schema";

// Lista de cursos com respectiva imagem
const COURSES = [
  { title: "Inglês", imageSrc: "/eua.png" },
  { title: "Espanhol", imageSrc: "/espanha.png" },
  { title: "Turco", imageSrc: "/turkey.png" },
  { title: "Holandês", imageSrc: "/holanda.png" },
  { title: "Russo", imageSrc: "/russia.png" },
  { title: "Chinês", imageSrc: "/china.png" },
  { title: "Coreano", imageSrc: "/coreia.png" },
  { title: "Japonês", imageSrc: "/japao.png" },
  { title: "Alemão", imageSrc: "/alemao.png" },
  { title: "Francês", imageSrc: "/france.png" },
  { title: "Italiano", imageSrc: "/italia.png" },
];

async function main() {
  console.log("Seeding cursos...");

  // Insere cursos se ainda não existirem (evita duplicidade)
  for (const { title, imageSrc } of COURSES) {
    const existing = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.title, title));

    if (existing.length === 0) {
      const [inserted] = await db
        .insert(courses)
        .values({ title, imageSrc })
        .returning();

      // Cria unidade e lição mínimas para evitar telas vazias posteriormente
      const [unit] = await db
        .insert(units)
        .values({
          title: "Unidade 1",
          description: `Primeiros passos em ${title}`,
          courseId: inserted.id,
          order: 1,
        })
        .returning();

      await db.insert(lessons).values({
        title: "Lição 1",
        unitId: unit.id,
        order: 1,
      });

      console.log(`✔ Curso '${title}' criado.`);
    } else {
      console.log(`• Curso '${title}' já existe. Pulando.`);
    }
  }

  console.log("Seed concluído.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro ao executar seed:", err);
  process.exit(1);
});
