import { useEffect, useLayoutEffect, useRef, RefObject } from 'react';

const SCROLL_THRESHOLD = 10;

export default function useAutoScroll(active: boolean): RefObject<HTMLDivElement> {
  const scrollContentRef = useRef<HTMLDivElement>(null!);
  const isDisabled = useRef<boolean>(false);
  const prevScrollTop = useRef<number | null>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      const { scrollHeight, clientHeight, scrollTop } = document.documentElement;
      if (!isDisabled.current && scrollHeight - clientHeight > scrollTop) {
        document.documentElement.scrollTo({
          top: scrollHeight - clientHeight,
          behavior: 'smooth'
        });
      }
    });

    if (scrollContentRef.current) {
      resizeObserver.observe(scrollContentRef.current);
    }

    return () => resizeObserver.disconnect();
  });

  useLayoutEffect(() => {
    if (!active) {
      isDisabled.current = true;
      return;
    }

    // if user manually scrolls, detect it to disable auto scroll
    function onScroll() {
      // current scroll dimensions
      const { scrollHeight, clientHeight, scrollTop } = document.documentElement;

      // should we disable auto-scroll
      if (
        !isDisabled.current &&
        prevScrollTop.current &&
        window.scrollY < prevScrollTop.current &&
        scrollHeight - clientHeight > scrollTop + SCROLL_THRESHOLD) {
        isDisabled.current = true;
      }

      // should we re-enable auto-scroll
      else if (
        isDisabled.current &&
        scrollHeight - clientHeight <= scrollTop + SCROLL_THRESHOLD
      ) {
        isDisabled.current = false;
      }

      // store current position for next comparison
      prevScrollTop.current = globalThis.scrollY;

    }

    isDisabled.current = false;
    prevScrollTop.current = document.documentElement.scrollTop;
    globalThis.addEventListener('scroll', onScroll);

    return () => globalThis.removeEventListener('scroll', onScroll);

    // remove event listener whenever isLoading changes in ChatMessages
    // when active changes from false to true, old listener is removed but new one is also made
    // when active changes from true to false, old listener is removed but no new one is made
  }, [active]);

  return scrollContentRef
}
