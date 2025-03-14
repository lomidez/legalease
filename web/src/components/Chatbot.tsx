import { useState, useRef, useEffect } from 'react';
import { useImmer } from 'use-immer';
import { Message } from '@/types/chat';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import DraftButton from '@/components/DraftButton';
import api from '@/api';
import { parseSSEStream } from '@/utils';
import { MouseEvent } from 'react';
import { ButtonProps } from '@/types/chat';


// Import the image
import BeagleCrest from '@/assets/legalease.svg';

export default function Chatbot() {

  const sessionIdRef = useRef<number | null>(null);
  const [messages, setMessages] = useImmer<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm the LegalBeagle, your personal not-legally-certified business partner. Starting a business is confusing, so I want to sniff out your best path forward. To begin, please tell me about details about the business idea like: \n- Your Name, \n- Business Name, \n- Business Address \n- Number of Employees, \n- Funding Sources",
      loading: false
    }
  ]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [formattedSummary, setFormattedSummary] = useState<string>('');
  const [formattedDraft, setFormattedDraft] = useState<string>('');
  const [formattedNext, setFormattedNext] = useState<string>('');

  // New state for toggling instructions
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  const isLoading: boolean = messages.length > 0 ? messages[messages.length - 1].loading : false;

  const chatHistoryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const filterMessages = (messages: Message[]) => {
    //Used to filter out all messages not made by user or assistant (system, summary, or draft)
    return messages.filter(msg => msg.role === 'user' || msg.role === 'assistant');
  };

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

      // Filter out any roles that aren't user/assistant
      const filteredMessages = filterMessages(messages);

      // Send the filtered messages to the API
      const stream = await api.sendChatMessage(sessionIdRef.current, trimmedMessage, filteredMessages);

      // Handle streaming response
      for await (const textChunk of parseSSEStream(stream)) {
        setMessages(draft => {
          draft[draft.length - 1].content += textChunk;
        });
      }

      // Update loading status
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

  async function handleNext(): Promise<void> {
    if (sessionIdRef.current === null) {
      console.log("Session ID is not set.");
      return;
    }

    try {
      setFormattedNext('');

      const stream = await api.generate_next_steps(sessionIdRef.current);

      for await (const textChunk of parseSSEStream(stream)) {
        setFormattedNext(prev => prev + textChunk);
      }
    } catch (err) {
      console.log("Error while fetching draft:", err);
    }
  }


  return (
    <div className="bg-[#3E1F1B] min-h-screen p-0 w-full flex flex-col relative">
      {/* Static Header with the Logo, Welcome text, and Show Instructions Button */}
      <div className="w-full p-4 bg-[#D8C79D] flex items-center justify-between fixed top-0 left-0 right-0 z-10">
        <div className="w-full">
          <h2 className="text-md font-semibold">
            <strong>
              Welcome to LegalEase!
            </strong></h2>
          <p> This free service is provided to support Washington residents who aspire to open a business. Users can brainstorm their business idea, identify an appropriate business structure, and recieve guidance on next steps towards opening.
            The LegalBeagle will walk you through your options and help you choose the best business structure for your needs. <br></br><i>This AI agent is not a legal representative. Any recommendations should not be considered legal advice.</i></p>

        </div>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className={`${isLoading ? 'bg-[#B0B0B0] cursor-not-allowed' : 'bg-[#3E1F1B] text-[#D8C79D] hover:bg-[#B82F1A]'} 
          border-2 border-[#D8C79D] text-white font-semibold py-1 px-3 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D8C79D]`}
        >
          {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
        </button>
        <img src={BeagleCrest} alt="LegalEase Emblem" className="w-40 h-40" />
      </div>
      <div className="flex flex-col mt-[300px]">

        {/* Instructions Window */}
        {showInstructions && (
          <div className="instructions-window fixed top-1/4 left-1/8 z-20 w-3/4 bg-[#F1C6C6] p-4 rounded-md shadow-xl max-h-[400px] overflow-auto border-2 border-black flex flex-col">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-2 right-2 text-[#3E1F1B] text-lg font-semibold"
            >
              X
            </button>
            <div className="w-full text-left"> {/* Remove text-center and set text-left */}
              <p><strong>Step 1: Converse with the LegalBeagle:</strong></p>
              <p>- Start by introducing your business idea, and the LegalBeagle will start sniffing out the ideal structure for your business.</p>
              <p>- Provide details like your business name, address, number of employees, and funding sources.</p>
              <p><strong>Step 2: Generate Business Summary</strong></p>
              <p>- Once you feel like you have adequately described your business, click 'Generate Business Summary'.</p>
              <p>- Your conversation so far will be summarized and an appropriate business structure will be recommended.</p>
              <p><strong>Step 3: Ask for Next Steps</strong></p>
              <p>- Once you like the summary created about your business, click the Next Steps button to be given more direction on how to proceed with your specified structure.</p>
              <p>- Any missing information required for our identified structure will be requested. If unavailable, you will be instructed on how to find it. </p>
              <p><strong>Step 4: Refinement</strong></p>
              <p>- Submit information requested in Step 3 to the LegalBeagle.</p>
              <p>- Repeat the process to refine results.</p>
            </div>
          </div>
        )}


        {/*spacer */}
        <div style={{ height: '200px' }}></div>



        {/* Chat History Section */}
        <div ref={chatHistoryRef} className="chat-history w-full mb-4 max-h-[600px] overflow-y-auto p-4 border-l border-r border-[#D8C79D] rounded-none bg-[#D8C79D] text-xs flex-grow">
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            setNewMessage={setNewMessage}
            submitNewMessage={submitNewMessage}
          />
        </div>
        {/*spacer */}
        <div style={{ height: '1px' }}></div>




        {/* Chat Input */}
        <ChatInput
          newMessage={newMessage}
          isLoading={isLoading}
          setNewMessage={setNewMessage}
          submitNewMessage={submitNewMessage}
        />



        {/*spacer */}
        <div style={{ height: '13px' }}></div>
        {/* Generate Business Summary and Draft Articles sections */}
        <div className="mb-4 flex gap-4 w-full">
          <div className="w-1/2 p-0">
            <DraftButton
              label="2: Generate Business Summary"
              onClick={handleSummarize}
              isLoading={isLoading}
              className="bg-[#B0B0B0] border-[#D8C79D] border mb-4 w-full"
            />
            <div className="mt-4 p-4 border rounded-none bg-[#D8C79D] overflow-auto max-h-96 text-xs w-full">
              <pre className="whitespace-pre-wrap break-words">{formattedSummary || ' '}</pre>
            </div>
          </div>




          <div className="w-1/2 p-0">
            <DraftButton
              label="3: Next Steps"
              onClick={handleNext}
              isLoading={isLoading}
              className="bg-[#B0B0B0] border-[#D8C79D] border mb-4 w-full"
            />
            <div className="mt-4 p-4 border rounded-none bg-[#D8C79D] overflow-auto max-h-96 text-xs w-full">
              <pre className="whitespace-pre-wrap break-words">{formattedNext || ' '}</pre>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}