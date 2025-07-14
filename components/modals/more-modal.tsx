"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMoreModal } from "@/store/use-more-modal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const MoreModal = () => {
  const { isOpen, close } = useMoreModal();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const goTo = (path: string) => {
    close();
    router.push(path);
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold mb-4">Mais</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-y-4">
          <Button variant="ghost" className="justify-start" onClick={() => goTo("/settings")}>Configurações</Button>
          <Button variant="ghost" className="justify-start" onClick={() => goTo("/help")}>Ajuda</Button>
          <Button variant="danger" className="justify-start" onClick={() => goTo("/logout")}>Sair</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
