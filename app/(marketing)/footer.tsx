import { Button } from "@/components/ui/button";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 p-2">
      <div className="max-w-screen-lg mx-auto flex items-center justify-evenly h-full">
        <Button size="lg" variant="ghost" className="w-full transition-transform duration-300 ease-in-out hover:scale-105 hover:animate-wiggle">
          <Image 
            src="/croata.png" 
            alt="Croatian" 
            height={32} 
            width={40}
            className="mr-4 rounded-md"
          />
          Croatiano
        </Button>
        <Button size="lg" variant="ghost" className="w-full transition-transform duration-300 ease-in-out hover:scale-105 hover:animate-wiggle">
          <Image 
            src="/espanha.png" 
            alt="Spanish" 
            height={32} 
            width={40}
            className="mr-4 rounded-md"
          />
          Espanhol
        </Button>
        <Button size="lg" variant="ghost" className="w-full transition-transform duration-300 ease-in-out hover:scale-105 hover:animate-wiggle">
          <Image 
            src="/eua.png" 
            alt="Eua" 
            height={32} 
            width={40}
            className="mr-4 rounded-md"
          />
          Americano
        </Button>
        <Button size="lg" variant="ghost" className="w-full transition-transform duration-300 ease-in-out hover:scale-105 hover:animate-wiggle">
          <Image 
            src="/france.png" 
            alt="French" 
            height={32} 
            width={40}
            className="mr-4 rounded-md"
          />
          Francês
        </Button>
        <Button size="lg" variant="ghost" className="w-full transition-transform duration-300 ease-in-out hover:scale-105 hover:animate-wiggle">
          <Image 
            src="/italia.png" 
            alt="Italiano" 
            height={32} 
            width={40}
            className="mr-4 rounded-md"
          />
          Italiano
        </Button>
        <Button size="lg" variant="ghost" className="w-full transition-transform duration-300 ease-in-out hover:scale-105 hover:animate-wiggle">
          <Image 
            src="/japao.png" 
            alt="Japonês" 
            height={32} 
            width={40}
            className="mr-4 rounded-md"
          />
          Japonês
        </Button>
        <Button size="lg" variant="ghost" className="w-full transition-transform duration-300 ease-in-out hover:scale-105 hover:animate-wiggle">
          <Image 
            src="/alemao.png" 
            alt="Alemao" 
            height={32} 
            width={40}
            className="mr-4 rounded-md"
          />
          Alemão
        </Button>
      </div>
    </footer>
  );
};
