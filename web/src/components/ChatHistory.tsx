import ChatMessages from '@/components/ChatMessages';
import { Message } from '@/types/chat';
import React from 'react';
import styled from 'styled-components';

interface Props {
    messages: Message[];
    isLoading: boolean;
    setNewMessage: (msg: string) => void;
    submitNewMessage: () => Promise<void>; 
}

const ChatContainer = styled.div`
  width: 100%;
  max-width: 800px;
  height: 100%;
  max-height: 600px;
  margin: 1rem auto;
  overflow-y: auto;
  padding: 1rem;
  border: 1px solid #D8C79D;
  background-color: #D8C79D;
  font-size: 0.75rem;
  flex-grow: 1;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function ChatHistory({ messages, isLoading, setNewMessage, submitNewMessage }: Props) {
    return (
        <ChatContainer>
            <ChatMessages 
                messages={messages} 
                isLoading={isLoading} 
                setNewMessage={setNewMessage} 
                submitNewMessage={submitNewMessage} 
            />
        </ChatContainer>
    );
}