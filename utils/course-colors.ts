// Mapeia curso (por slug ou título) para um array de cores (gradiente)
// Adicione aqui novas línguas conforme necessário.
export const COURSE_COLORS: Record<string, string[]> = {
  german: ["#000000", "#dd0000", "#ffce00"], // preto, vermelho, amarelo
  spanish: ["#aa151b", "#f1bf00"],
  french:  ["#0055a4", "#ffffff", "#ef4135"],
  italian: ["#008c45", "#ffffff", "#cd212a"],
  english: ["#00247d", "#ffffff", "#cf142b"],
};

// Retorna cores baseadas em course.title ou code (lowercase)
export const getCourseColors = (courseTitle: string): string[] => {
  const key = courseTitle.toLowerCase();
  const found = Object.entries(COURSE_COLORS).find(([name]) => key.includes(name));
  return found ? found[1] : ["#58cc02"];
};
