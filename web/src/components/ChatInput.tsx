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
    <div>
      <textarea
        ref={textareaRef}
        // numbers have to be in curly braces too
        rows={1}
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={submitNewMessage}>
        <img src={sendIcon} alt="send" />
      </button>
    </div>
  );
}
