'use client';
import { useEffect, useRef, useState } from 'react';
import { authoring, briefs, builds, lab, person, route } from '@/content/site';
import { asset, SUMMARY } from '@/lib/asset';

// The easter egg: press ` (backtick) anywhere on the home page. A smaller cousin of the
// terminal in the 3D journey, without the camera commands.

const CMDS: Record<string, () => string | void> = {
  help: () =>
    'whoami    who you are talking to\ntimeline  the roles, with dates\nbuilds    software I wrote\nbooks     authoring\nbriefs    custom projects\nstack     tools of the trade\ncontact   how to reach me\nsummary   everything on one page\nexplore   the old 3D journey\nclear / exit',
  whoami: () => `${person.name}\n${person.nowShort}.\n${person.span}`,
  timeline: () =>
    route
      .slice()
      .reverse()
      .map((r) => `${r.period.padEnd(18)}${r.role ?? ''}\n${' '.repeat(18)}${r.org}`)
      .join('\n'),
  builds: () => builds.items.map((b) => `${b.name}${b.live ? `\n  ${b.live}` : ''}`).join('\n'),
  books: () => authoring.books.map((b) => `${b.n}  ${b.title}`).join('\n'),
  briefs: () => briefs.items.map((b) => `${b.n}  ${b.title}`).join('\n'),
  stack: () => lab.groups.map((g) => `${g.title}\n  ${g.items.join(', ')}`).join('\n'),
  contact: () => `LinkedIn: ${person.linkedinShort}\n${person.location}`,
  summary: () => {
    window.location.href = SUMMARY;
  },
  explore: () => {
    window.location.href = asset('/explore/');
  },
};

export default function LabTerminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<string[]>(['abdul.os  type help, or exit to close.']);
  const [value, setValue] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.closest('input, textarea, [contenteditable]') && t !== input.current;
      if (e.key === '`' && !typing) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('lab-terminal', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('lab-terminal', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight });
  }, [lines]);

  if (!open) return null;

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === 'clear') return setLines([]);
    if (cmd === 'exit') return setOpen(false);
    const out = CMDS[cmd] ? CMDS[cmd]() : `${cmd}: not found. try help`;
    setLines((l) => [...l, `$ ${raw}`, ...(out ? [out] : [])]);
  };

  return (
    <div className="lab-term" role="dialog" aria-label="Terminal">
      <div className="lab-term-body" ref={body}>
        {lines.map((l, i) => (
          <pre key={i}>{l}</pre>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(value);
          setValue('');
        }}
      >
        <label>
          <span aria-hidden="true">{person.prompt}</span>
          <input
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Command"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </label>
      </form>
    </div>
  );
}

/** A visible way in, for people without a backtick key. */
export function TerminalButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event('lab-terminal'))}>
      Open the terminal
    </button>
  );
}
