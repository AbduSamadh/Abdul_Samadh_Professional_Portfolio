'use client';
import { useEffect, useRef, useState } from 'react';
import { emit, navigate, on, setSwarmRandom } from '@/lib/journey';
import { DESTINATIONS } from '@/lib/path';
import { setTheme, cycleTheme, type ThemeName } from '@/lib/theme';
import { authoring, briefs, builds, lab, person } from '@/content/site';

const BOOT = '<b>abdul.os</b> 12.0\nType <i>help</i> for commands, <i>ls</i> for places, <i>exit</i> to close.';

// Ported from the original site's terminal, plus `cd` to fly the camera.
const CMDS: Record<string, (arg: string) => string | void> = {
  help: () =>
    '<b>commands</b>\n  whoami      who you are talking to\n  practice    what I actually do\n  ls          places you can go\n  cd &lt;place&gt;  fly there\n  builds      software I wrote\n  books       authoring\n  briefs      custom projects\n  stack       tools of the trade\n  swarm       random | clean\n  theme       amber | phosphor | paper\n  phos        phosphor mode\n  contact     how to reach me\n  clear / exit',
  whoami: () =>
    `${person.name}\n${person.nowShort}.\nTwelve years of ICT, AI and STREAM education, KG to Grade 13,\nacross the UAE, GCC, Singapore and India.\nCurriculum, competitions, and the software that teaches them.`,
  practice: () =>
    'Outcomes-driven curriculum, built twice:\n  offline  kits, labs, printed workbooks, bench procedures\n  online   modular courses, video scripts, in-browser grading\nSubjects: ICT, AI literacy, STREAM.\nAlways with the teacher training attached.',
  ls: () => 'studio/  teach/  write/  build/  solve/  lab/  scale/  contact/  .secrets',
  cd: (arg) => {
    const k = arg.replace(/\/$/, '').replace(/^~?\/?/, '') || 'home';
    const key = k === '..' ? 'home' : k;
    if (!(key in DESTINATIONS)) return `cd: no such place: ${arg}   try <i>ls</i>`;
    navigate(DESTINATIONS[key]);
    setTimeout(() => emit('terminal', false), 500);
    return `descending to <b>${key}</b>...`;
  },
  builds: () =>
    '<b>live</b>\n' +
    builds.items
      .map((b) => `  ${b.id.padEnd(11)} ${b.name}${b.live ? '  [live]' : ''}`)
      .join('\n') +
    '\n<i>cd build</i> to walk through them.',
  books: () => authoring.books.map((b) => `  ${b.n}  ${b.title}`).join('\n'),
  briefs: () => briefs.items.map((b) => `  ${b.n}  ${b.title}`).join('\n'),
  stack: () => lab.bays.map((b) => `<b>${b.title}</b>\n  ${b.items.join(', ')}`).join('\n'),
  swarm: (arg) => {
    if (arg === 'random') {
      setSwarmRandom(true);
      return 'planner: random pairing. watch it fail.';
    }
    if (arg === 'clean' || arg === 'safe') {
      setSwarmRandom(false);
      return 'planner: collision-free.';
    }
    return 'usage: swarm random | clean';
  },
  theme: (arg) => {
    if (arg === 'amber' || arg === 'phosphor' || arg === 'paper') {
      setTheme(arg as ThemeName);
      return `theme: ${arg}`;
    }
    cycleTheme();
    return 'flipped.';
  },
  phos: () => {
    setTheme('phosphor');
    return 'done.';
  },
  contact: () => `LinkedIn: <a href="${person.linkedin}" target="_blank" rel="noopener noreferrer">${person.linkedinShort}</a>\nDubai, UAE.`,
  linkedin: () => {
    window.open(person.linkedin, '_blank', 'noopener');
    return 'opening LinkedIn...';
  },
  sudo: () => 'You already have root here.',
  'cat .secrets': () => 'Do the boring parts properly. Test everything. Ship it anyway.',
};

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [out, setOut] = useState<string[]>([BOOT]);
  const input = useRef<HTMLInputElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => on('terminal', setOpen), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
      if ((e.key === '`' || e.key === '~') && !typing) {
        e.preventDefault();
        emit('terminal', true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      opener.current = document.activeElement;
      setTimeout(() => input.current?.focus(), 50);
    } else if (opener.current instanceof HTMLElement) {
      opener.current.focus();
    }
  }, [open]);

  useEffect(() => {
    outRef.current?.scrollTo({ top: outRef.current.scrollHeight });
  }, [out]);

  const run = (raw: string) => {
    const v = raw.trim().toLowerCase();
    if (!v) return;
    if (v === 'clear') return setOut([BOOT]);
    if (v === 'exit') return emit('terminal', false);
    const [cmd, ...rest] = v.split(/\s+/);
    const fn = CMDS[v] ?? CMDS[cmd];
    const res = fn ? fn(CMDS[v] ? '' : rest.join(' ')) : `command not found: ${escapeHtml(v)}   try <i>help</i>`;
    setOut((o) => [...o, `<span class="p">${person.prompt}</span> ${escapeHtml(v)}`, ...(res ? [res] : [])]);
  };

  return (
    <div className={`term ${open ? 'open' : ''}`} role="dialog" aria-label="Terminal" aria-hidden={!open}>
      <div className="term-bar">
        <span>abdul.os — terminal</span>
        <button onClick={() => emit('terminal', false)} aria-label="Close terminal">
          ×
        </button>
      </div>
      <div className="term-out" ref={outRef} aria-live="polite">
        {out.map((l, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: l }} />
        ))}
      </div>
      <form
        className="term-in"
        onSubmit={(e) => {
          e.preventDefault();
          run(input.current!.value);
          input.current!.value = '';
        }}
      >
        <span className="p" style={{ color: 'inherit' }}>
          {person.prompt}
        </span>
        <input
          ref={input}
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal input"
          tabIndex={open ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === 'Escape') emit('terminal', false);
          }}
        />
      </form>
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
