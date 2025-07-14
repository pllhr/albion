"use server";

import { auth } from "@clerk/nextjs";
import db from "@/db/drizzle";
import { userProgress, uiLanguageEnum } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateUiLanguage(courseId: number, lang: "de" | "en" | "pt") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  // atualiza uiLanguage para o registro do usuário
  await db
    .update(userProgress)
    .set({ uiLanguage: lang })
    .where(eq(userProgress.userId, userId));

  // opcional: poderia validar cursoId corresponde ao activeCourseId
  return { success: true };
}
