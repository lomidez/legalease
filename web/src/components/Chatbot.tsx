import { useState, useRef, useEffect } from 'react';
import { useImmer } from 'use-immer';
import { Message } from '@/types/chat';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import DraftButton from '@/components/DraftButton';
import api from '@/api';
import { parseSSEStream } from '@/utils';

// Import the image
import BeagleCrest from '@/assets/legalease.svg';

export default function Chatbot() {
  const sessionIdRef = useRef<number | null>(null);
  const [messages, setMessages] = useImmer<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm the LegalBeagle, your personal not-legally-certified business partner.\nStarting a business is confusing, so I want to sniff out your best path forward.\nTo begin, please tell me about details about the business idea like: \n- Your Name, \n- Business Name, \n- Business Address \n- Number of Employees, \n- Funding Sources",
      loading: false
    }
  ]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [formattedSummary, setFormattedSummary] = useState<string>(''); 
  const [formattedDraft, setFormattedDraft] = useState<string>(''); 

  const isLoading: boolean = messages.length > 0 ? messages[messages.length - 1].loading : false;

  const chatHistoryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]); 

  async function submitNewMessage(): Promise<void> {
    const trimmedMessage: string = newMessage.trim();

    if (!trimmedMessage || isLoading) return;

    setMessages(draft => [
      ...draft,
      { role: 'user', content: trimmedMessage },
      { role: 'assistant', content: '', loading: true }
    ]);
    setNewMessage('');

    try {
      if (!sessionIdRef.current) {
        sessionIdRef.current = await api.createChat();
      }

      if (sessionIdRef.current === null) {
        throw new Error("Session ID is null, something went wrong!");
      }

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
    if (sessionIdRef.current === null) {
      console.log("Session ID is not set.");
      return;
    }

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

  async function handleDraft(): Promise<void> {
    if (sessionIdRef.current === null) {
      console.log("Session ID is not set.");
      return;
    }

    try {
      setFormattedDraft('');

      const stream = await api.draft_articles(sessionIdRef.current);

      for await (const textChunk of parseSSEStream(stream)) {
        setFormattedDraft(prev => prev + textChunk);
      }
    } catch (err) {
      console.log("Error while fetching draft:", err);
    }
  }

  return (
    <div className="bg-[#3E1F1B] p-6">
      <div className="instructions p-4 bg-[#D8C79D] rounded-lg mb-4 text-xs text-left flex items-start">
        {/* Image to the left of the instructions */}
        <div>

          <h2 className="text-md font-semibold"><strong>Welcome to LegalEase:</strong></h2>
          <p><strong>Step 1: Converse with LegalEase</strong></p>
          <p>- Start by introducing your business idea.</p>
          <p>- Provide details like your name, business name, business address, number of employees, and funding sources.</p>
          <p><strong>Step 2: Generate Business Summary</strong></p>
          <p>- Once you feel like you have adequately described your business, click 'Generate Business Summary'.</p>
          <p>- Your conversation so far will be summarized and an appropriate business structure will be recommended.</p>
          <p><strong>Step 3: Draft Articles of Incorporation</strong></p>
          <p>- Once you like the summary created about your business, click Draft Articles of Incorporation.</p>
          <p>- Any missing information required for a complete Articles of Incorporation will be mentioned.</p>
          <p><strong>Step 4: Refinement</strong></p>
          <p>- Answer missing information identified in Step 3 to LegalEase.</p>
          <p>- Repeat the process to refine results.</p>
        </div>
        <img src={BeagleCrest} alt="LegalEase Emblem" className="w-84 h-84 mr-4" />
        
      </div>

      <div ref={chatHistoryRef} className="chat-history mb-4 max-h-[300px] overflow-y-auto p-4 border rounded-lg bg-[#D8C79D] text-xs">
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        setNewMessage={setNewMessage}
        submitNewMessage={submitNewMessage}
      />
      </div>

      <ChatInput
        newMessage={newMessage}
        isLoading={isLoading}
        setNewMessage={setNewMessage}
        submitNewMessage={submitNewMessage}
      />

      <div className="mb-4 flex gap-4">
        {/* Generate Business Summary Section */}
        <div className="w-1/2">
          <DraftButton
            label="Generate Business Summary"
            onClick={handleSummarize}
            isLoading={isLoading}
            className="bg-[#B0B0B0] border-[#D8C79D] border mb-4"
          />
          <div className="mt-4 p-4 border rounded-lg bg-[#D8C79D] overflow-auto max-h-96 text-xs">
            <pre className="whitespace-pre-wrap break-words">{formattedSummary || ' '}</pre>
          </div>
        </div>

        {/* Draft Articles of Incorporation Section */}
        <div className="w-1/2">
          <DraftButton
            label="Draft Articles of Incorporation"
            onClick={handleDraft}
            isLoading={isLoading}
            className="bg-[#B0B0B0] border-[#D8C79D] border mb-4"
          />
          <div className="mt-4 p-4 border rounded-lg bg-[#D8C79D] overflow-auto max-h-96 text-xs">
            <pre className="whitespace-pre-wrap break-words">{formattedDraft || ' '}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}