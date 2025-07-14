"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { CourseSwitcher } from "@/components/course-switcher";
import { StreakCounter } from "@/components/streak-popover";
import { CrystalCounter } from "@/components/crystal-counter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { InfinityIcon, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { useT } from "@/providers/i18n-provider";
import { t } from "@/utils/i18n";

// Tipo mínimo vindo do banco; adicione campos conforme necessidade
interface UserProgress {
  userName: string;
  userImageSrc: string;
  hearts: number;
  points: number;
  crystals: number;
  activeCourse: {
    id: number | string;
    title: string;
    imageSrc: string | null;
  } | null;
  createdAt?: Date;
  streak?: number;
  xp?: number;
}

type Props = {
  userProgress: UserProgress;
  courses: { id: number; title: string; imageSrc: string | null; xp: number }[];
};

export const ProfileClient = ({ userProgress, courses }: Props) => {
  const t = useT();
  const { user } = useUser();
  const displayName = user?.fullName || userProgress.userName;
  const joinedDate = user?.createdAt ? new Date(user.createdAt) : userProgress.createdAt;
  const avatarUrl = user?.imageUrl || userProgress.userImageSrc || "/avatar1.png";

  const joinedCourses = courses;
  const mockStats = {
    streak: userProgress.streak ?? 0,
    xp: userProgress.xp ?? userProgress.points,
    league: "Gold",
    leagueWeek: 1,
  };

  // Configurações base de conquistas com múltiplos níveis
  const achievementConfigs = [
    {
      id: "wildfire",
      title: t("wildfire"),
      icon: "/ofensiva3png.png",
      color: "bg-red-600",
      thresholds: [3, 7, 14, 30, 60, 90, 125], // dias de ofensiva
      getStat: () => mockStats.streak,
      description: (total: number) => t("wildfire_1") + total + (total === 1 ? t("wildfire_3") : t("wildfire_2")),   
    },
    {
      id: "archer",
      title: t("archer"),
      icon: "/arco.png",
      color: "bg-green-600",
      thresholds: [1, 5, 20, 50, 100], // lições perfeitas
      getStat: () => (userProgress as any).perfectLessons ?? 0,
      description: (total: number) => t("archer_1") + total + t("archer_2"),
    },
    {
      id: "intellectual",
      title: t("intellectual"),
      icon: "/intelectual.png",
      color: "bg-pink-600",
      thresholds: [10, 50, 100, 300, 500], // palavras novas
      getStat: () => (userProgress as any).wordsLearned ?? 0,
      description: (total: number) => t("intellectual_1") + total + t("intellectual_2"),
    },
  ];

  // Constrói array final calculando nível e meta atual de forma dinâmica
  const achievements = useMemo(() => {
    return achievementConfigs.map((cfg) => {
      const stat = cfg.getStat();
      // encontra primeiro threshold maior que stat
      const nextIndex = cfg.thresholds.findIndex((t) => stat < t);
      const level = nextIndex === -1 ? cfg.thresholds.length : nextIndex + 1; // nível 1-n
      const total = cfg.thresholds[Math.min(nextIndex === -1 ? cfg.thresholds.length - 1 : nextIndex, cfg.thresholds.length - 1)];
      return {
        id: cfg.id,
        title: cfg.title,
        description: cfg.description(total),
        icon: cfg.icon,
        color: cfg.color,
        level,
        current: stat,
        total,
      };
    });
  }, [achievementConfigs]);

  return (
    <div className="relative w-full flex flex-col gap-y-6 pb-10 px-4">
      {/* Status bar */}
      <div className="fixed top-6 right-56 z-50 flex items-center gap-x-4">
        {userProgress.activeCourse && (
          <CourseSwitcher activeCourse={userProgress.activeCourse as any} />
        )}
        <StreakCounter showCard={false} />
        <CrystalCounter crystals={userProgress.crystals} />
        <Link href="/shop">
          <Button variant="ghost" className="text-orange-500 px-1">
            <Image
              src="/raio.png"
              height={24}
              width={24}
              alt="XP"
              className="mr-1"
            />
            {userProgress.points}
          </Button>
        </Link>
        <Link href="/shop">
          <Button variant="ghost" className="text-rose-500 px-1">
            <Image
              src="/vidas.png"
              height={22}
              width={22}
              alt="Vidas"
              className="mr-1"
            />
            {userProgress.hearts > 99 ? <InfinityIcon className="h-4 w-4" /> : userProgress.hearts}
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-blue-600 rounded-xl relative overflow-hidden px-4 pt-4 pb-4 flex flex-col text-start w-full max-w-3xl mr-auto">
        <div className="relative w-full h-24 bg-blue-700 rounded-md mb-3">
          {/* placeholder cover */}
          <Image
            src={user?.imageUrl || userProgress.userImageSrc || "/avatar1.png"}
            alt="Avatar"
            height={160}
            width={160}
            className="absolute -bottom-40 left-1/2 -translate-x-1/2 rounded-full shadow-2xl ring-2 ring-white/40 transition-shadow hover:ring-blue-300/60 hover:shadow-2xl object-cover"
          />
          <Button size="icon" className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-600">
            <Image src="/lapis.png" alt="Editar" width={40} height={40} />
          </Button>
        </div>
        <div className="mt-12 px-2">
          <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
          <p className="text-white/80">{`@${displayName.toLowerCase()}`}</p>
          {joinedDate && (
            <p className="text-sm text-white/60 mt-1">
              Por aqui desde {joinedDate.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
            </p>
          )}
          {/* Followers / Following */}
          <div className="flex gap-x-4 mt-3 font-bold text-white">
            <span className="text-blue-200">20 Following</span>
            <span className="text-blue-200">15 Followers</span>
          </div>
          {joinedCourses && joinedCourses.length > 0 && (
            <div className="flex justify-end mt-3">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex gap-x-2 items-center focus:outline-none">
                    {joinedCourses.slice(0, 2).map((course) => (
                      <Image
                        key={course.id}
                        src={course.imageSrc || "/flag_placeholder.png"}
                        alt={course.title}
                        width={24}
                        height={24}
                      />
                    ))}
                    {joinedCourses.length > 2 && (
                      <div className="opacity-40 bg-white/80 flex justify-center rounded-md text-white px-1 text-sm">
                        +{joinedCourses.length - 2}
                      </div>
                    )}
                  </button>
                </DialogTrigger>

                <DialogContent className="max-w-sm bg-[#0f1c24] border-none text-white p-0 overflow-visible rounded-lg">
                  <h2 className="text-center text-lg font-bold py-3 border-b border-[#28404f]">Todos os idiomas</h2>
                  <div className="p-4">
                    <div className="rounded-2xl border border-[#28404f] overflow-hidden divide-y divide-[#1e2a33]">
                      {joinedCourses.map((c) => (
                        <div key={c.id} className="flex items-center justify-between bg-[#0d1a22] px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Image src={c.imageSrc || "/flag_placeholder.png"} alt={c.title} width={32} height={32} />
                            <span className="font-medium">{c.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-400 font-bold">{c.xp} XP</span>
                            <ChevronRight className="h-4 w-4 text-white/60" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      <hr className="my-3 border-t-2 border-blue-400/70" />

      <div className="flex flex-col gap-y-4">
        {/* Statistics */}
        <section className="-mt-4">
          <h3 className="font-bold text-xl mb-4">Estatísticas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="group relative p-4 bg-white/60 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-lg border border-white/40 rounded-2xl shadow-2xl ring-2 ring-white/40 transition-shadow hover:ring-blue-300/60 hover:shadow-2xl flex items-center gap-x-3 transition-transform duration-300 hover:scale-105">
              <Image src="/ofensiva3png.png" alt="Streak" width={32} height={32} />
              <div>
                <p className="text-2xl font-bold">{mockStats.streak}</p>
                <p className="text-sm text-muted-foreground">Dias seguidos</p>
              </div>
            </div>
            <div className="group relative p-4 bg-white/60 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-lg border border-white/40 rounded-2xl shadow-2xl ring-2 ring-white/40 transition-shadow hover:ring-blue-300/60 hover:shadow-2xl flex items-center gap-x-3 transition-transform duration-300 hover:scale-105">
              <Image src="/points.png" alt="XP" width={32} height={32} />
              <div>
                <p className="text-2xl font-bold">{mockStats.xp}</p>
                <p className="text-sm text-muted-foreground">Total XP</p>
              </div>
            </div>
            <div className="group relative p-4 bg-white/60 bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-lg border border-white/40 rounded-2xl shadow-2xl ring-2 ring-white/40 transition-shadow hover:ring-blue-300/60 hover:shadow-2xl flex items-center gap-x-3 transition-transform duration-300 hover:scale-[1.02]">
              <Image src="/escudeiro.png" alt="League" width={32} height={32} />
              <div>
                <p className="font-bold flex items-center gap-x-1">
                  {mockStats.league}
                  <span className="uppercase text-[10px] font-bold bg-neutral-500 text-white px-1.5 py-0.5 rounded-md">WEEK {mockStats.leagueWeek}</span>
                </p>
                <p className="text-sm text-muted-foreground">Liga atual</p>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl">Conquistas</h3>
            <button className="text-sm text-blue-500 hover:underline">Ver tudo</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {achievements.map((ach) => (
              <div key={ach.id} className="group relative p-4 bg-white/60 bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-lg border border-white/40 rounded-2xl shadow-2xl ring-2 ring-white/40 transition-shadow hover:ring-blue-300/60 hover:shadow-2xl flex gap-4 items-start overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl shadow-inner ring-2 ring-white/30 group-hover:ring-blue-300/60 transition ${ach.color}`}>
                  <Image src={ach.icon} alt={ach.title} width={32} height={32} />
                  <span className="text-[10px] text-white font-bold mt-1">NÍVEL {ach.level}</span>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-lg">{ach.title}</p>
                    <span className="text-sm text-blue-500 font-bold">{ach.current}/{ach.total}</span>
                  </div>

                  <div className="w-full h-3 bg-neutral-200/60 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-500/80 rounded-full shadow-inner transition-[width] duration-700"
                      style={{ width: `${Math.min(100, Math.max(4, (ach.current / ach.total) * 100))}%` }}
                    />
                  </div>

                  <p className="text-sm text-neutral-600 mt-1">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
