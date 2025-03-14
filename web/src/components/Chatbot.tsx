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
          <Section>
            <SummarySection handleSummarize={handleSummarize} formattedSummary={formattedSummary} isLoading={isLoading} />
          </Section>
          <Section>
            <NextStepsSection handleNext={handleNext} formattedNext={formattedNext} isLoading={isLoading} />
          </Section>
        </SectionsWrapper>
      </ContentWrapper>
    </ChatContainer>
  );
}

const ChatContainer = styled.div`
  background-color: rgb(62, 31, 27);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  max-width: 1600px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 1rem;
`;

const SectionsWrapper = styled.div`
  display: flex;
  flex-direction: row; /* Ensures they are side by side */
  justify-content: space-between; /* Creates space between sections */
  padding-top: 1rem;
  width: 100%;

  gap: 1rem; /* Adds spacing between the two sections */
`;

const Section = styled.div`
  flex: 1; /* Ensures equal width for both sections */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  
  border: 1px solid #D8C79D;
  padding: 1rem;
  background-color: #D8C79D;
  border-radius: 8px;

  /* Parameters to make sure it doesn't expand uncontrollably */
  max-width: 50%; /* Ensures both sections take half the space */
  overflow: hidden; /* Prevents content from forcing expansion */
  min-height: 200px; 

  /* If content overflows, enable scrolling */
  overflow-y: auto; 
  word-wrap: break-word;
  white-space: pre-wrap;
`;

