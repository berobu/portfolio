import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';

// Lazy-load the animation components so their large data payloads are
// fetched as separate async chunks and don't block Vite's SSR module runner.
const AsciiJellyfish1 = lazy(() => import('./ascii/AsciiJellyfish1'));
const AsciiFish = lazy(() => import('./ascii/AsciiFish'));
const AsciiJellyfish2 = lazy(() => import('./ascii/AsciiJellyfish2'));

type AnimApi = {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  restart: () => void;
};

// Total animation loop duration per component (ms): Jellyfish1, Fish, Jellyfish2
const DURATIONS: [number, number, number] = [7050, 7050, 7550];
const FADE_MS = 1500;

// State machine phases:
// "playing"    — current animal at opacity 1, all others at 0
// "fading-out" — current fades 1→0 over FADE_MS, next stays at 0
// "fading-in"  — next fades 0→1 over FADE_MS, current stays at 0
type Phase = 'playing' | 'fading-out' | 'fading-in';

const AsciiSequence = () => {
  const [phase, setPhase] = useState<Phase>('playing');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(1);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiRefs = useRef<(AnimApi | null)[]>([null, null, null]);

  const handleReady0 = useCallback((api: AnimApi) => { apiRefs.current[0] = api; }, []);
  const handleReady1 = useCallback((api: AnimApi) => { apiRefs.current[1] = api; }, []);
  const handleReady2 = useCallback((api: AnimApi) => { apiRefs.current[2] = api; }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (phase === 'playing') {
      // Fish/Jellyfish2 have already run for FADE_MS during fading-in before
      // this phase starts, so subtract 2×FADE_MS to ensure the fade-out
      // *completes* at the loop point rather than starting there.
      // Jellyfish1's first appearance gets the same treatment: fade-out
      // finishes 1500ms before the loop, which is still invisible (opacity=0).
      timerRef.current = setTimeout(() => {
        setPhase('fading-out');
      }, Math.max(0, DURATIONS[currentIdx] - 2 * FADE_MS));

    } else if (phase === 'fading-out') {
      // Current is fading 1→0 via CSS; after FADE_MS restart next and begin fade-in
      timerRef.current = setTimeout(() => {
        apiRefs.current[nextIdx]?.restart(); // reset next to frame 0 before it appears
        setPhase('fading-in');
      }, FADE_MS);

    } else if (phase === 'fading-in') {
      // Next is fading 0→1 via CSS; after FADE_MS promote next to current
      timerRef.current = setTimeout(() => {
        apiRefs.current[currentIdx]?.restart(); // silently reset outgoing at opacity 0
        setCurrentIdx(nextIdx);
        setNextIdx((nextIdx + 1) % 3);
        setPhase('playing');
      }, FADE_MS);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, currentIdx, nextIdx]);

  // Opacity is derived purely from phase + indices.
  // INVARIANT: never more than one layer at non-zero opacity simultaneously.
  // CSS transition on each layer handles the visual 1→0 or 0→1 interpolation.
  const layerOpacity = (idx: number): number => {
    if (phase === 'playing')    return idx === currentIdx ? 1 : 0;
    if (phase === 'fading-out') return 0; // currentIdx CSS-transitions from 1 to this 0
    if (phase === 'fading-in')  return idx === nextIdx ? 1 : 0; // nextIdx CSS-transitions from 0 to 1
    return 0;
  };

  const layerStyle = (idx: number) => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: layerOpacity(idx),
    transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  });

  return (
    <div style={{ position: 'relative', width: '1425.6px', height: '900px' }}>
      <div style={layerStyle(0)}>
        <Suspense fallback={null}>
          <AsciiJellyfish1 autoPlay showControls={false} onReady={handleReady0} />
        </Suspense>
      </div>
      <div style={layerStyle(1)}>
        <Suspense fallback={null}>
          <AsciiFish autoPlay showControls={false} onReady={handleReady1} />
        </Suspense>
      </div>
      <div style={layerStyle(2)}>
        <Suspense fallback={null}>
          <AsciiJellyfish2 autoPlay showControls={false} onReady={handleReady2} />
        </Suspense>
      </div>
    </div>
  );
};

export default AsciiSequence;
