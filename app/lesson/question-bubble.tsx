import Image from "next/image";
import { useAudio } from "react-use";
import { cn } from "@/lib/utils";

type Props = {
  question: string;
  imageSrc?: string; // Mascote opcional
  audioSrc?: string; // Som opcional
  disabled?: boolean; // Bloqueia clique no áudio
};

export const QuestionBubble = ({ question, imageSrc = "/boneco.png", audioSrc, disabled }: Props) => {
  const [audio, , controls] = useAudio({ src: audioSrc || "" });

  return (
    <div className="flex items-center gap-x-4 mb-6">
      <Image
        src={imageSrc}
        alt="Mascote"
        height={90}
        width={90}
        className="hidden lg:block"
      />
      <Image
        src={imageSrc}
        alt="Mascote"
        height={60}
        width={60}
        className="block lg:hidden"
      />
      <div className="relative py-4 px-6 border-2 rounded-xl text-base lg:text-lg flex items-center gap-3">
        {audio}
        {audioSrc && !disabled && (
          <button onClick={() => { controls.seek(0); controls.play(); }} className="focus:outline-none">
            <Image src="/somalto.png" alt="Play sound" height={28} width={28} />
          </button>
        )}
        {question}
        <div
          className="absolute -left-3 top-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-y-1/2 rotate-90"
        />
      </div>
    </div>
  );
};
