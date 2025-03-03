import useAutoScroll from '@/hooks/useAutoScroll';
import Spinner from '@/components/Spinner';
import userIcon from '@/assets/user.svg';
import assistantIcon from '@/assets/robot.svg';
import { ChatMessagesProps } from '@/types/chat';
import { RefObject } from 'react';

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollContentRef: RefObject<HTMLDivElement> = useAutoScroll(isLoading);
  return (
    <div ref={scrollContentRef} className="space-y-6 py-4">
      {messages.map(({ role, content, loading, error }, idx) => (
        <div key={idx} className={`flex items-start gap-6 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
          <div className="flex-shrink-0 mt-1">
            {role === 'user' ? (
              <img src={userIcon} alt='user icon' className='w-12 h-12' />
            ) : (
              <img src={assistantIcon} alt='assistant icon' className='w-12 h-12' />
            )}
          </div>
          <div className={`w-[70%] text-left flex-1 rounded-xl p-4 ${role === 'user'
            ? 'bg-blue-50 text-blue-900'
            : 'bg-gray-100 text-gray-800'}`}>
            {(loading && !content) ? <Spinner /> :
              <div className="whitespace-pre-wrap">{content}</div>
            }
            {error && (
              <div>
                <span>Beep boop error in chatmessages</span>
              </div>
            )}
          </div>
        </div>
      ))
      }
    </div >
  );
}
