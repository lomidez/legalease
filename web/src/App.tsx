import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useImmer } from 'use-immer';
import { Message } from '@/types/chat';
import Chatbot from '@/components/Chatbot';
import SummaryPage from '@/components/SummarySection';
import DraftPage from './components/DraftSection';
import NextStepsPage from './components/NextStepsSection';
import Navigation from '@/components/Navigation';
import api from '@/api';
import { parseSSEStream } from '@/utils';
import styled from 'styled-components';
import "./App.css";

export default function App() {
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
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isNextStepsLoading, setIsNextStepsLoading] = useState(false);

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
      const stream = await api.sendChatMessage(sessionIdRef.current, trimmedMessage);
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
      setIsSummaryLoading(true);
      const stream = await api.summarize(sessionIdRef.current);

      // Process the stream
      for await (const textChunk of parseSSEStream(stream)) {
        setFormattedSummary(prev => prev + textChunk);
      }

      // Only set loading to false after the stream is complete
      setIsSummaryLoading(false);
    } catch (err) {
      console.log("Error while fetching summary:", err);
      setIsSummaryLoading(false);
    }
  }

  async function handleDraft(): Promise<void> {
    if (!sessionIdRef.current) return console.log("Session ID is not set.");
    try {
      setFormattedNext('');
      setIsNextStepsLoading(true);
      const stream = await api.draft_articles(sessionIdRef.current);

      // Process the stream
      for await (const textChunk of parseSSEStream(stream)) {
        setFormattedNext(prev => prev + textChunk);
      }

      // Only set loading to false after the stream is complete
      setIsNextStepsLoading(false);
    } catch (err) {
      console.log("Error while fetching next steps:", err);
      setIsNextStepsLoading(false);
    }
  }

  async function handleNext(): Promise<void> {
    if (!sessionIdRef.current) return console.log("Session ID is not set.");
    try {
      setFormattedNext('');
      setIsNextStepsLoading(true);
      const stream = await api.generate_next_steps(sessionIdRef.current);

      // Process the stream
      for await (const textChunk of parseSSEStream(stream)) {
        setFormattedNext(prev => prev + textChunk);
      }

      // Only set loading to false after the stream is complete
      setIsNextStepsLoading(false);
    } catch (err) {
      console.log("Error while fetching next steps:", err);
      setIsNextStepsLoading(false);
    }
  }

  return (
    <BrowserRouter>
      <AppContainer>
        <Routes>
          <Route path="/" element={
            <Chatbot
              messages={messages}
              newMessage={newMessage}
              isLoading={isLoading}
              showInstructions={showInstructions}
              setNewMessage={setNewMessage}
              setShowInstructions={setShowInstructions}
              submitNewMessage={submitNewMessage}
            />
          } />
          <Route path="/summary" element={
            <SummaryPage
              handleSummarize={handleSummarize}
              formattedSummary={formattedSummary}
              isLoading={isSummaryLoading}
              className="page-container"
            />
          } />
          <Route path="/next-steps" element={
            <NextStepsPage
              handleNext={handleNext}
              formattedNext={formattedNext}
              isLoading={isNextStepsLoading}
              className="page-container"
            />
          } />
          <Route path="/draft" element={
            <DraftPage
              handleDraft={handleDraft}
              formattedNext={formattedNext}
              isLoading={isNextStepsLoading}
              className="page-container"
            />
          } />
        </Routes>
        <Navigation hasSummary={!!formattedSummary} />
      </AppContainer>
    </BrowserRouter>
  );
}

const AppContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: rgb(62, 31, 27);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  
  .page-container {
    min-height: 100vh;
    width: 100%;
    max-width: 1200px;
    padding: 2rem;
    margin: 0 auto;
    background-color: #D8C79D;
    border-radius: 8px;
    margin-top: 2rem;
    margin-bottom: 5rem;
  }
`;
