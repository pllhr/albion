"use client";
// cache simples em memória para evitar múltiplas requisições
const wordCache = new Map<string, WordInfo>();
import { useEffect, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  lang: 'en' | 'pt' | 'de';
  text: string;
  known?: Set<string>;
  bookId?: string;
  chapterIndex?: number;
}

interface WordInfo {
  word: string;
  definition?: string;
  partOfSpeech?: string;
  example?: string;
  translation?: string;
  synonyms?: string[];
  loading: boolean;
}

import { useTransition } from 'react';
import { markKnownWord } from '@/app/actions/mark-known-word';
import { markChapterRead } from '@/app/actions/mark-chapter-read';
import { saveAnnotation } from '@/app/actions/save-annotation';
import type { AnnotationInput } from '@/app/actions/save-annotation';

import { useReaderSettings } from '@/providers/reader-settings-context';
import { ReaderToolbar } from '@/components/reader-toolbar';

export const StoryReader = ({ lang, text, known, bookId, chapterIndex }: Props) => {
  const [selected, setSelected] = useState<(WordInfo & { index: number }) | null>(null);
  const [popupPos, setPopupPos] = useState<{x:number;y:number}|null>(null);
  const [knownLocal, setKnownLocal] = useState(new Set(Array.from(known ?? [])));
  const [shake, setShake] = useState(false);
  const [page, setPage] = useState(0);
  const { font, theme, color } = useReaderSettings();
  const [annotations, setAnnotations] = useState<Array<{id:number;start:number;end:number;color:string}>>([]);

  const [isPending, startTransition] = useTransition();

  const handleWordClick = (raw: string, index: number, evt: React.MouseEvent<HTMLSpanElement>) => {
    // limpar pontuação e normalizar
    const w = raw.replace(/[.,!?;:()\[\]"'«»]/g, "").normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    // se já no cache
    if(wordCache.has(w)) {
      setSelected({ ...wordCache.get(w)!, index });
    setPopupPos({x: evt.clientX, y: evt.clientY});
      return;
    }
    setSelected({ word: raw, loading: true, index });
  setPopupPos({x: evt.clientX, y: evt.clientY});
    if (bookId !== undefined && chapterIndex !== undefined) {
      fetch('/api/book-chapter-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, chapterIndex, word: w.toLowerCase() })
      }).catch(()=>{});
    }

    async function fetchDict(word: string): Promise<{ definition?: string; example?: string; partOfSpeech?: string; synonyms?: string[] }> {
      // 1. dictionaryapi.dev na língua atual
      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${lang}/${word}`);
        if (res.ok) {
          const json: any = await res.json();
          if (Array.isArray(json) && json.length) {
            const m = json[0].meanings?.[0];
            const d = m?.definitions?.[0];
            if (d?.definition) return { definition: d.definition, example: d.example, partOfSpeech: m?.partOfSpeech };
          }
        }
      } catch {}

      // 2. Dicionário Aberto para pt
      if (lang === 'pt') {
        try {
          const res = await fetch(`https://dicionario-aberto.net/word/${encodeURIComponent(word)}`);
          if (res.ok) {
            const json: any = await res.json();
            if (Array.isArray(json) && json.length) {
              // a definição vem em xml en.wiktionary; extrair texto simples rapidamente
              const def = json[0].xml?.match(/<def[^>]*>(.*?)<\/def>/)?.[1]?.replace(/<[^>]+>/g,'');
              if (def) return { definition: def };
            }
          }
        } catch {}
      }

      // 3. Traduzir para inglês e tentar dictionaryapi EN
      try {
        const enWord = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=en&dt=t&q=${encodeURIComponent(word)}`).then(r=>r.json()).then((j:any)=>j[0][0][0] as string);
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${enWord}`);
        if (res.ok) {
          const json: any = await res.json();
          if (Array.isArray(json) && json.length) {
            const m = json[0].meanings?.[0];
            const d = m?.definitions?.[0];
            if (d?.definition) return { definition: d.definition, example: d.example, partOfSpeech: m?.partOfSpeech };
          }
        }
      } catch {}

      // 4. Wikipedia summary (ignorar disambiguation)
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
        if (res.ok) {
          const j: any = await res.json();
          if (j.type !== 'disambiguation' && !/may refer to/i.test(j.extract ?? '')) {
            const firstSentence = j.extract?.split('. ')[0];
            if (firstSentence) return { definition: firstSentence };
          }
        }
      } catch {}
      return {} as { definition?: string; example?: string; partOfSpeech?: string; synonyms?: string[] };
    }

    const dictPromise: Promise<{ definition?: string; example?: string; partOfSpeech?: string; synonyms?: string[] }> = fetchDict(w);

    const target = 'pt';
    const transPromise = fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=${target}&dt=t&q=${encodeURIComponent(raw)}`)
      .then((r) => r.json())
      .then((json) => {
        // json example: [[["branco","white",null,null,1]],null,"en"]
        return Array.isArray(json) && Array.isArray(json[0]) && Array.isArray(json[0][0]) ? (json[0][0][0] as string) : undefined;
      })
      .catch(() => undefined);

    const synonymPromise = fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(w)}&max=5&v=eswl`).then(r=>r.json()).then((arr:any)=>arr.map((o:any)=>o.word) as string[]).catch(()=>undefined);

  Promise.all([dictPromise, transPromise, synonymPromise]).then(([dictRes, translation, syns]) => {
      const info: WordInfo & { index: number } = {
        word: raw,
        definition: dictRes.definition,
        example: dictRes.example,
        partOfSpeech: dictRes.partOfSpeech,
        translation,
        synonyms: syns ?? dictRes.synonyms,
        loading: false,
        index,
      };
      wordCache.set(w, info);
      setSelected(info);
    });
  };

  const close = () => setSelected(null);

  // carregar anotações do capítulo
  useEffect(() => {
    if (!bookId || chapterIndex === undefined) return;
    fetch(`/api/annotations?bookId=${bookId}&chapterIndex=${chapterIndex}`)
      .then(r=>r.json())
      .then((data:any[])=>{
        setAnnotations(data.map(a=>({id:a.id,start:a.startOffset,end:a.endOffset,color:a.color})));
      }).catch(()=>{});
  }, [bookId, chapterIndex]);

  // Split em parágrafos (dupla quebra de linha) e paginação simples
  const paragraphsAll = text.trim().split(/(?:\r?\n){2,}/g);
  const PAGE_SIZE = 6;
  const totalPages = Math.ceil(paragraphsAll.length / PAGE_SIZE);
  const paragraphs = paragraphsAll.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // contador global de palavras para index único
  let wordCounter = page * 100000; // garante unicidade entre páginas

  const nextPage = () => setPage(p => Math.min(p + 1, totalPages - 1));

  // --- seleção para highlight ---
  useEffect(() => {
    function handleMouseUp() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      const container = document.getElementById('reader-content');
      if (!container || !container.contains(range.commonAncestorContainer)) return;
      const offsetInContainer = (node: Node, offset: number): number => {
        let count = 0;
        function traverse(current: Node) {
          if (current === node) {
            count += offset;
            throw new Error('done');
          }
          if (current.nodeType === Node.TEXT_NODE) {
            count += current.textContent?.length ?? 0;
          }
          current.childNodes.forEach(traverse);
        }
        try { traverse(container); } catch { }
        return count;
      };
      const start = offsetInContainer(range.startContainer, range.startOffset);
      const end = offsetInContainer(range.endContainer, range.endOffset);
      if (start === end) return;
      const pageStartOffset = paragraphsAll.slice(0, page * PAGE_SIZE).reduce((acc, p)=> acc + p.length + 2, 0);
      const globalStart = pageStartOffset + start;
      const globalEnd = pageStartOffset + end;
      const input: AnnotationInput = { bookId: Number(bookId), chapterIndex: chapterIndex!, startOffset: globalStart, endOffset: globalEnd, type: 'highlight', color };
      saveAnnotation(input).then(res=>{
        setAnnotations(prev=>[...prev,{id:res.id,start:globalStart,end:globalEnd,color}]);
      }).catch(()=>{});
      sel.empty();
    }
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [page, paragraphsAll, PAGE_SIZE, color, bookId, chapterIndex]);
  const prevPage = () => setPage(p => Math.max(p - 1, 0));
  
  const pageNumber = page + 1;
  const chapterNumber = (chapterIndex ?? 0) + 1;

  return (
    <>
      <div id="reader-content" className={`relative rounded-[6px] shadow-2xl p-10 pt-20 mx-auto w-full leading-relaxed space-y-6 text-justify ${font === 'serif' ? 'font-serif' : font === 'sans' ? 'font-sans' : 'font-mono'}`}  style={{
      backgroundColor: theme === 'light' ? '#fdfcf9' : theme === 'sepia' ? '#f4ecd8' : '#1e1e1e',
       color: theme === 'dark' ? '#f5f5f5' : '#111',
      backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 29px, rgba(180,180,180,0.15) 30px), url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNC41IiBoZWlnaHQ9IjEwMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQuNSIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjZmZmIi8+PC9zdmc+')`,
      backgroundBlendMode: 'multiply',
      backgroundRepeat: 'repeat, repeat',
      boxShadow: '0 4px 8px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.05)',
      backgroundSize: '100% 28px, 4.5px 4.5px',
      borderLeft: '6px solid rgba(55,65,81,0.25)',
      filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))',
    }}>
      <ReaderToolbar />
      <span className="absolute left-0 top-0 bottom-0 w-4 bg-gray-200/60 shadow-inner pointer-events-none" />
      <span className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />
      <p className="absolute top-6 inset-x-0 text-center text-lg italic text-gray-600 select-none">Capítulo {chapterNumber}.</p>
      

      {/* render com highlights + spans clicáveis */}
      {paragraphs.map((para, pidx) => {
        // ajuda para transformar texto em spans-palavra
        const toWordSpans = (segment: string) => {
          return segment.split(/(\s+)/).map(tok => {
            if (/\s+/.test(tok)) return tok;
            const idx = wordCounter++;
            return (
              <span
                key={idx}
                onClick={(e) => handleWordClick(tok, idx, e)}
                className={`cursor-pointer underline ${knownLocal.has(tok.toLowerCase()) ? 'decoration-green-500 text-green-700' : 'decoration-blue-500 text-blue-700'}`}
              >
                {tok}
              </span>
            );
          });
        };

        const pageStartOffset = paragraphsAll
          .slice(0, page * PAGE_SIZE)
          .reduce((acc, p) => acc + p.length + 2, 0);
        const paraStart = pageStartOffset + paragraphs.slice(0, pidx).reduce((a, b) => a + b.length + 2, 0);
        const paraEnd = paraStart + para.length;
        const relevant = annotations.filter(a => !(a.end <= paraStart || a.start >= paraEnd));

        if (relevant.length === 0) {
          return (
            <p key={pidx} className="indent-8 first:indent-0 select-text">
              {toWordSpans(para)}
            </p>
          );
        }

        // existe pelo menos um highlight – precisamos quebrar
        const pieces: React.ReactNode[] = [];
        let cursor = 0;
        const sorted = [...relevant].sort((a, b) => a.start - b.start);

        sorted.forEach(a => {
          const relStart = a.start - paraStart;
          const relEnd = a.end - paraStart;
          if (cursor < relStart) {
            pieces.push(...toWordSpans(para.slice(cursor, relStart)));
          }
          pieces.push(
            <mark key={`${a.id}-${cursor}`} style={{ backgroundColor: a.color }}>
              {toWordSpans(para.slice(relStart, relEnd))}
            </mark>
          );
          cursor = relEnd;
        });

        if (cursor < para.length) {
          pieces.push(...toWordSpans(para.slice(cursor)));
        }

        return (
          <p key={pidx} className="indent-8 first:indent-0 select-text">
            {pieces}
          </p>
        );
      })}

    <div className="flex justify-between mt-6">
      <Button size="sm" onClick={prevPage} disabled={page === 0}><ArrowLeft /></Button>
      <p className="text-sm text-gray-500 italic text-center select-none">Página {pageNumber} de {totalPages}.</p>
      <Button size="sm" onClick={nextPage} disabled={page === totalPages - 1}><ArrowRight /></Button>
    </div>
    <Button variant="default" size="sm" className="mx-auto mt-8" onClick={() => {
      if (!bookId || chapterIndex === undefined) return;
      markChapterRead(bookId, chapterIndex).catch(()=>{});
    }}>✔️ Marcar capítulo como lido</Button>  
  </div>
  {selected && popupPos && (
    <div style={{position:'fixed', top: popupPos.y+20, left: popupPos.x, zIndex:50, transform:'translateX(-50%)'}} className="w-72 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-gray-200 dark:ring-gray-600">
        {selected.loading ? (
          <div className="flex items-center justify-center py-4"><Loader2 className="animate-spin" /></div>
        ) : (
          <div>
            <p className="text-xl font-bold mb-1 capitalize">{selected.word}</p>
            {selected.definition && <p className="mb-2 text-sm">{selected.definition}</p>}
            {selected.translation && <p className="mb-2 text-sm italic text-green-700">{selected.translation}</p>}
            {selected.synonyms && selected.synonyms.length>0 && (
              <p className="mb-2 text-xs text-gray-600">Sinônimos: {selected.synonyms.slice(0,5).join(', ')}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm" onClick={()=>{
                const utter = new SpeechSynthesisUtterance(selected.word);
                speechSynthesis.speak(utter);
              }}>PLAY</Button>
              <Button size="sm" variant="secondary" onClick={close}>CLOSE</Button>
              {bookId && chapterIndex!==undefined && (
                <Button size="sm" className="ml-auto" onClick={()=>{
                  markKnownWord(bookId, chapterIndex, selected.word   ).then(()=>{
                    setKnownLocal(prev=> new Set(prev).add(selected!.word.toLowerCase()));
                    close();
                  });
                }}>MARCAR COMO CONHECIDA</Button>
              )}
            </div>
          </div>
        )}
    </div>
  )}
</>
);
};

// estilo global para animação shake
if (typeof window !== 'undefined') {
  const styleId = 'shake-keyframes';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `@keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px);} 60% { transform: translateX(-6px);} 80% { transform: translateX(6px);} } .animate-shake { animation: shake 0.5s; }`;
    document.head.appendChild(style);
  }
}
