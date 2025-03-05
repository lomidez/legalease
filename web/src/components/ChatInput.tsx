import useAutoSize from '@/hooks/useAutoSize';
import sendIcon from '@/assets/send.svg';
import { KeyboardEvent, RefObject } from 'react';
import { ChatInputProps } from '@/types/chat';

export default function ChatInput({ newMessage, isLoading, setNewMessage, submitNewMessage }: ChatInputProps) {
  const textareaRef: RefObject<HTMLTextAreaElement | null> = useAutoSize(newMessage);

  // only handle keyboard event happening in textarea
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.keyCode === 13 && !e.shiftKey && !isLoading) {
      // prevent creating newline using enter
      e.preventDefault();
      submitNewMessage();
    }
  }

  return (
    <div className="w-full flex items-center mt-4 bg-[#D8C79D] p-2 rounded-lg">
      <textarea
        ref={textareaRef}
        // numbers have to be in curly braces too
        rows={1}
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full resize-none border-none bg-[#D8C79D] text-black focus:outline-none rounded-lg p-3"
      />
      <button
        onClick={submitNewMessage}
        className="!bg-transparent !border-none p-0 ml-4 flex items-center justify-center"
      >
        <img src={sendIcon} alt="send" className="w-10 h-10" />
      </button>
    </div>
  );
}
