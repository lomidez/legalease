import useAutosize from '@/hooks/useAutosize';
import sendIcon from '@/assets/send.svg';
import { KeyboardEvent, RefObject } from 'react';
import { ChatInputProps } from '@/types/chat';

export default function ChatInput({ newMessage, isLoading, setNewMessage, submitNewMessage }: ChatInputProps) {
  const textareaRef: RefObject<HTMLTextAreaElement> = useAutosize(newMessage)

  // only handle keyboard event happening in textarea
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.keyCode === 13 && !e.shiftKey && !isLoading) {
      // prevent creating newline using enter
      e.preventDefault();
      submitNewMessage();
    }
  }

  return (
    <div className="w-full flex items-center pt-5">
      <textarea
        ref={textareaRef}
        // numbers have to be in curly braces too
        rows={1}
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full resize-none border focus:outline-none rounded-lg p-3"
      />
      <button onClick={submitNewMessage} className="!bg-transparent !border-none p-0">
        <img src={sendIcon} alt="send" className='w-10 h-10' />
      </button>
    </div>
  );
}
