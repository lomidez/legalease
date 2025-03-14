import useAutoSize from '@/hooks/useAutoSize';
import sendIcon from '@/assets/send.svg';
import { KeyboardEvent, RefObject } from 'react';
import { ChatInputProps } from '@/types/chat';
import styled from 'styled-components';

const InputContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-top: 1rem;
  background-color: #D8C79D;
  padding: 0.5rem;
  border-radius: 0.5rem;
  position: relative;
`;

const ArrowIcon = styled.div`
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  resize: none;
  border: none;
  background-color: white;
  color: black;
  font-size: 1rem;
  padding: 0.75rem 1rem 0.75rem 2rem;
  border-radius: 0.5rem;
  outline: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SendButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  margin-left: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const SendIcon = styled.img`
  width: 2.5rem;
  height: 3.75rem;
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
      <ArrowIcon>
        <svg width="50" height="19" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,0 12,5 0,10" fill="black" />
        </svg>
      </ArrowIcon>

      <StyledTextarea
        ref={textareaRef}
        rows={1}
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <SendButton onClick={submitNewMessage}>
        <SendIcon src={sendIcon} alt="send" />
      </SendButton>
    </InputContainer>
  );
}
