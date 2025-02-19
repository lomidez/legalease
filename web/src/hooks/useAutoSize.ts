import { RefObject, useLayoutEffect, useRef, useState } from "react";

export default function useAutosize(
  message: string,
): RefObject<HTMLTextAreaElement> {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [borderWidth, setBorderWidth] = useState<number>(0);

  // useLayoutEffect rather than useEffect because effect mutates the dom node
  // and the mutation changes the appearance of the dom node (resizing)
  useLayoutEffect(() => {
    if (!ref.current) return;
    const style = globalThis.getComputedStyle(ref.current);
    setBorderWidth(
      parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth),
    );
  }, []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    // reset height to default state, so that it shrinks when content is removed
    ref.current.style.height = "inherit";
    // match current height -- notice the +, without the inherit it would stay large
    ref.current.style.height = `${ref.current.scrollHeight + borderWidth}px`;
  }, [message, borderWidth]);

  return ref;
}
