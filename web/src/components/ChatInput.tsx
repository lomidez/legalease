import useAutoSize from '@/hooks/useAutoSize';
import { KeyboardEvent, RefObject } from 'react';
import { ChatInputProps } from '@/types/chat';
import styled from 'styled-components';
import { ArrowRight } from 'lucide-react';

const InputContainer = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  align-items: center;
  margin: 1rem auto 0;
  background-color: #D8C79D;
  padding: 0.5rem;
  border-radius: 0.5rem;
  position: relative;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  resize: none;
  border: none;
  background-color: white;
  color: #374151;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  outline: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SendButton = styled.button`
  background-color: #D8C79D;
  color: #3E1F1B;
  border: none;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  margin-left: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #C4B48A;
    transform: scale(1.05);
  }
  
  &:disabled {
    background-color: #8B5E57;
    color: #6D4C46;
    cursor: not-allowed;
    transform: none;
  }
`;

export default function ChatInput({ newMessage, isLoading, setNewMessage, submitNewMessage }: ChatInputProps) {
  const textareaRef: RefObject<HTMLTextAreaElement | null> = useAutoSize(newMessage);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.keyCode === 13 && !e.shiftKey && !isLoading) {
      e.preventDefault();
      submitNewMessage();
    }
  }

  return (
    <InputContainer>

      <StyledTextarea
        ref={textareaRef}
        rows={1}
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <SendButton 
        onClick={submitNewMessage} 
        disabled={isLoading || !newMessage.trim()}
        aria-label="Send message"
      >
        <ArrowRight size={20} />
      </SendButton>
    </InputContainer>
  );
}
