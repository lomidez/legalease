import { useState, useRef, useEffect } from 'react';
import { useImmer } from 'use-immer';
import { Message } from '@/types/chat';
import ChatHeader from '@/components/ChatHeader';
import ChatInstructions from '@/components/ChatInstructions';
import ChatHistory from '@/components/ChatHistory';
import ChatControls from '@/components/ChatControls';
import SummarySection from '@/components/SummarySection';
import NextStepsSection from '@/components/NextStepsSection';
import api from '@/api';
import { parseSSEStream } from '@/utils';
import styled from 'styled-components';

const ChatContainer = styled.div`
  background-color: rgb(62, 31, 27);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 5rem; 
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  margin-top: 1rem; /* Adjusted to ensure proper spacing below header */
`;

const SectionsWrapper = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
`;

export default function Chatbot() {
  const sessionIdRef = useRef<number | null>(null);
  const [messages, setMessages] = useImmer<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm the LegalBeagle, your personal not-legally-certified business partner. Starting a business is confusing, so I want to sniff out your best path forward. To begin, please tell me about details about the business idea like: \n- Your Name, \n- Business Name, \n- Business Address \n- Number of Employees, \n- Funding Sources",
      loading: false
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [formattedSummary, setFormattedSummary] = useState('');
  const [formattedNext, setFormattedNext] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const isLoading: boolean = messages.length > 0 ? messages[messages.length - 1].loading : false;

  useEffect(() => {
    if (!sessionIdRef.current) {
      api.createChat().then(id => (sessionIdRef.current = id));
    }
  }, []);

  async function submitNewMessage(): Promise<void> {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isLoading) return;

    setMessages(draft => [
      ...draft,
      { role: 'user', content: trimmedMessage },
      { role: 'assistant', content: '', loading: true }
    ]);
    setNewMessage('');

    try {
      if (!sessionIdRef.current) throw new Error("Session ID is null, something went wrong!");
      const stream = await api.sendChatMessage(sessionIdRef.current, trimmedMessage, messages);
      for await (const textChunk of parseSSEStream(stream)) {
        setMessages(draft => {
          draft[draft.length - 1].content += textChunk;
        });
      }
      setMessages(draft => {
        draft[draft.length - 1].loading = false;
      });
    } catch (err) {
      console.log(err);
      setMessages(draft => {
        draft[draft.length - 1].loading = false;
        draft[draft.length - 1].error = true;
      });
    }
  }

  async function handleSummarize(): Promise<void> {
    if (!sessionIdRef.current) return console.log("Session ID is not set.");
    try {
      setFormattedSummary('');
      const stream = await api.summarize(sessionIdRef.current);
      for await (const textChunk of parseSSEStream(stream)) {
        setFormattedSummary(prev => prev + textChunk);
      }
    } catch (err) {
      console.log("Error while fetching summary:", err);
    }
  }

  async function handleNext(): Promise<void> {
    if (!sessionIdRef.current) return console.log("Session ID is not set.");
    try {
      setFormattedNext('');
      const stream = await api.generate_next_steps(sessionIdRef.current);
      for await (const textChunk of parseSSEStream(stream)) {
        setFormattedNext(prev => prev + textChunk);
      }
    } catch (err) {
      console.log("Error while fetching next steps:", err);
    }
  }

  return (
    <ChatContainer>
      <ChatHeader toggleInstructions={() => setShowInstructions(!showInstructions)} showInstructions={showInstructions} />
      {showInstructions && <ChatInstructions closeInstructions={() => setShowInstructions(false)} />}
      <ContentWrapper>
        <ChatHistory messages={messages} isLoading={isLoading} setNewMessage={setNewMessage} submitNewMessage={submitNewMessage} />
        <ChatControls newMessage={newMessage} isLoading={isLoading} setNewMessage={setNewMessage} submitNewMessage={submitNewMessage} />
        <SectionsWrapper>
          <SummarySection handleSummarize={handleSummarize} formattedSummary={formattedSummary} isLoading={isLoading} />
          <NextStepsSection handleNext={handleNext} formattedNext={formattedNext} isLoading={isLoading} />
        </SectionsWrapper>
      </ContentWrapper>
    </ChatContainer>
  );
}
