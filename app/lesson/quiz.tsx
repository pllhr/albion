"use client";

import { toast } from "sonner";
import Image from "next/image";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useAudio, useWindowSize, useMount } from "react-use";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { reduceHearts } from "@/actions/user-progress";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { challengeOptions, challenges, userSubscription } from "@/db/schema";
import { usePracticeModal } from "@/store/use-practice-modal";
import { upsertChallengeProgress } from "@/actions/challenge-progress";

import { Header } from "./header";
import { Footer } from "./footer";
import { Challenge } from "./challenge";
import { ResultCard } from "./result-card";
import { QuestionBubble } from "./question-bubble";

type Props ={
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: typeof challengeOptions.$inferSelect[];
  })[];
  userSubscription: typeof userSubscription.$inferSelect & {
    isActive: boolean;
  } | null;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  userSubscription,
}: Props) => {
  const { open: openHeartsModal } = useHeartsModal();
  const { open: openPracticeModal } = usePracticeModal();

  useMount(() => {
    if (initialPercentage === 100) {
      openPracticeModal();
    }
  });

  const { width, height } = useWindowSize();

  const router = useRouter();

  const [finishAudio] = useAudio({ src: "/finish.mp3", autoPlay: true });
  const [
    correctAudio,
    _c,
    correctControls,
  ] = useAudio({ src: "/correct.wav" });
  const [
    incorrectAudio,
    _i,
    incorrectControls,
  ] = useAudio({ src: "/incorrect.wav" });
  const [pending, startTransition] = useTransition();

  const [lessonId] = useState(initialLessonId);
  const [hearts, setHearts] = useState(initialHearts);
  const [showLifeWarn, setShowLifeWarn] = useState(false);
  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  const extraChallenge = {
    id: -1,
    type: "SELECT" as const,
    question: "Qual destas imagens é \"chá\"?",
  questionAudioSrc: "/qual_destas_imagens_is_tee.mp3",
    completed: false,
    challengeOptions: [
      // usando -1 como challengeId fictício para corresponder ao tipo
      { id: -11, challengeId: -1, text: "zucker", imageSrc: "/acuçar.png", audioSrc: "/zucker.mp3", correct: false } as any,
      { id: -12, challengeId: -1, text: "kaffee", imageSrc: "/cafe.png", audioSrc: "/kaffee.mp3", correct: false } as any,
      { id: -13, challengeId: -1, text: "tee", imageSrc: "/cha.png", audioSrc: "/tee.mp3", correct: true } as any,
    ],
  } as const;

  const [challenges] = useState(() => [...initialLessonChallenges, extraChallenge]);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex((challenge) => !challenge.completed);
    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });

  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");

  const challenge = challenges[activeIndex];
  const options = challenge?.challengeOptions ?? [];

  const onNext = () => {
    setSelectedOption(undefined);
    setStatus("none");
    setActiveIndex((current) => current + 1);
  };

  const handleSkip = () => {
    onNext();
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;

    setSelectedOption((prev) => prev === id ? undefined : id);
  };

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    const correctOption = options.find((option) => option.correct);

    if (!correctOption) {
      return;
    }

    if (correctOption.id === selectedOption) {
      startTransition(() => {
        (challenge.id > 0 ? upsertChallengeProgress(challenge.id) : Promise.resolve({}))
          .then((response) => {
            if (response?.error === "hearts") {
              openHeartsModal();
              return;
            }

            correctControls.play();
            setStatus("correct");
            setPercentage((prev) => prev + 100 / challenges.length);

            // This is a practice
            if (initialPercentage === 100) {
              setHearts((prev) => Math.min(prev + 1, 5));
            }
          })
          .catch(() => toast.error("Algo deu errado. Tente novamente."));
      });
    } else {
      startTransition(() => {
        if (challenge.id > 0) {
          reduceHearts(challenge.id)
            .then((response) => {
              if (response?.error === "hearts") {
                openHeartsModal();
                return;
              }
              incorrectControls.play();
              setStatus("wrong");
              if (!response?.error) {
                setHearts((prev) => {
                  const newVal = Math.max(prev - 1, 0);
                  if (prev === initialHearts && !showLifeWarn) {
                    setShowLifeWarn(true);
                  }
                  return newVal;
                });
              }
            })
            .catch(() => toast.error("Algo deu errado. Tente novamente."));
        } else {
          // Caso id inválido (desafio local extra), apenas processa localmente
          incorrectControls.play();
          setStatus("wrong");
          setHearts((prev) => {
            const newVal = Math.max(prev - 1, 0);
            if (prev === initialHearts && !showLifeWarn) {
              setShowLifeWarn(true);
            }
            return newVal;
          });
        }
      });
    }
  };

  if (!challenge) {
    return (
      <>
        {finishAudio}
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
        />
        <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
          <Image
            src="/finish.svg"
            alt="Finish"
            className="hidden lg:block"
            height={100}
            width={100}
          />
          <Image
            src="/finish.svg"
            alt="Finish"
            className="block lg:hidden"
            height={50}
            width={50}
          />
          <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
            Excelente! <br /> Você completou a lição.
          </h1>
          <div className="flex items-center gap-x-4 w-full">
            <ResultCard
              variant="points"
              value={challenges.length * 10}
            />
            <ResultCard
              variant="hearts"
              value={hearts}
            />
          </div>
        </div>
        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/learn")}
          showSkip
          onSkip={handleSkip}
        />
      </>
    );
  }

  const title = challenge.type === "ASSIST"
    ? "Selecione o significado correto"
    : "";

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      <Dialog open={showLifeWarn} onOpenChange={setShowLifeWarn}>
        <DialogContent className="max-w-md">
          <div className="flex justify-center mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Image key={i} src="/heart.svg" alt="Heart" height={24} width={24} className="mx-0.5" />
            ))}
          </div>
          <DialogTitle className="text-center font-bold text-xl">Cada erro tira 1 vida!</DialogTitle>
          <DialogDescription className="text-center">Tenha foco e cuidado para não perder suas vidas. Vá, você consegue!</DialogDescription>
          <DialogFooter className="mt-4">
            <Button variant="primary" className="w-full" onClick={() => setShowLifeWarn(false)}>Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />
      <div className="flex-1">
        <div className="h-full flex items-center justify-center">
          <div className="relative lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12 mt-32 lg:mt-40">
            {title && (
              <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
              {title}
              </h1>
            )}
            {challenge.type !== "SELECT" && (
                <div className="absolute inset-0 -z-10 pointer-events-none bg-[repeating-linear-gradient(#ffffff_0px,#ffffff_24px,#94a3b8_25px,#94a3b8_26px)] opacity-90" />
              )}
              <div>
              {
                // Determina áudio: coluna questionAudioSrc ou áudio da opção correta
                (() => {
                  const questionAudio = (challenge as any).questionAudioSrc ?? challenge.challengeOptions.find((o:any) => o.correct)?.audioSrc;
                  return (
                    <QuestionBubble
                      question={challenge.question}
                      imageSrc="/avatar1.png"
                      audioSrc={questionAudio ?? "/default-audio.mp3"} // compute questionAudio fallback
                    />
                  );
                })()
              }
              {challenge.type !== "SELECT" && (
                <div className="mt-6 mb-4 space-y-14">
                  <div className="h-1 bg-slate-400" />
                  <div className="h-1 bg-slate-400" />
                </div>
              )}
              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                type={challenge.type}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer
        disabled={pending || !selectedOption}
        status={status}
        onCheck={onContinue}
        onSkip={handleSkip}
        showSkip
      />
    </>
  );
};
