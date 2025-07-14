export const COURSE_FLAGS: Record<string, string> = {
  german: "/german-flag-02.png",
  spanish: "/spanish-flag.png",
  french: "/french-flag.png",
  italian: "/italian-flag.png",
  english: "/uk-flag.png",
};

export const getCourseFlag = (courseTitle: string): string | null => {
  const key = courseTitle.toLowerCase();
  const found = Object.entries(COURSE_FLAGS).find(([name]) => key.includes(name));
  return found ? found[1] : null;
};
