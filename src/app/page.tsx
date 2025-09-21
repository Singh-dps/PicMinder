
'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { JarvisHeader } from '@/components/jarvis/jarvis-header';
import { PhotoUploader } from '@/components/jarvis/photo-uploader';
import { ResultsDisplay } from '@/components/jarvis/results-display';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppState, ScannedItem } from '@/context/app-state-context';
import { jarvisChat, JarvisChatRequest, Message } from '@/ai/flows/jarvis-chat';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BrainCircuit, User } from 'lucide-react';
import { HistoryView } from '@/components/jarvis/history-view';

export default function Home() {
  const { addScannedItem } = useAppState();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeScannedItem, setActiveScannedItem] = useState<ScannedItem | null>(null);
  const [historyItems, setHistoryItems] = useState<ScannedItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSendMessage = async (text: string, photoDataUri?: string) => {
    if (!text && !photoDataUri) return;

    const userMessage: Message = { role: 'user', content: [{ text }] };
    if (photoDataUri) {
      userMessage.content.push({ media: { url: photoDataUri } });
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setHistoryItems([]);
    setActiveScannedItem(null);

    try {
      const chatRequest: JarvisChatRequest = {
        messages: [...messages, userMessage],
      };

      const { response, scannedItem, history } = await jarvisChat(chatRequest);

      setMessages((prev) => [...prev, response]);

      if (scannedItem) {
        setActiveScannedItem(scannedItem);
        addScannedItem(scannedItem);
      }
      if(history) {
        setHistoryItems(history);
      }

    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        role: 'model',
        content: [
          { text: 'Sorry, I encountered an error. Please try again.' },
        ],
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        variant: 'destructive',
        title: 'Processing Error',
        description: 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      handleSendMessage('Analyze this photo.', dataUri);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setActiveScannedItem(null);
    setHistoryItems([]);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground antialiased w-full max-w-md mx-auto">
      <JarvisHeader />
      <main className="flex-1 flex flex-col p-4 overflow-y-auto" ref={scrollRef}>
        <div className="flex-1 flex flex-col space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'model' && (
                <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                  <AvatarFallback>
                    <BrainCircuit size={20}/>
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted rounded-bl-none'
                }`}
              >
                {message.content.map((part, i) => {
                  if (part.text) {
                    return <p key={i}>{part.text}</p>;
                  }
                  if (part.media) {
                     return (
                      <div key={i} className="mt-2">
                        <img src={part.media.url} alt="user upload" className="rounded-lg" />
                      </div>
                    )
                  }
                  return null;
                })}
              </div>
               {message.role === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <User size={20}/>
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <AnimatePresence>
            {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 justify-start"
                >
                  <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                    <AvatarFallback>
                      <BrainCircuit size={20}/>
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-muted rounded-bl-none">
                     <div className="flex items-center gap-2 text-sm font-semibold">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Thinking...</span>
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {activeScannedItem && (
             <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border rounded-lg p-4"
             >
                <Button
                    variant="ghost"
                    size="sm"
                    className="self-start mb-4"
                    onClick={handleReset}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to chat
                  </Button>
                  <ResultsDisplay
                    scannedItem={activeScannedItem}
                  />
             </motion.div>
          )}

          {historyItems.length > 0 && (
             <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border rounded-lg p-4"
             >
                <Button
                    variant="ghost"
                    size="sm"
                    className="self-start mb-4"
                    onClick={handleReset}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to chat
                  </Button>
                  <HistoryView scannedItems={historyItems} />
             </motion.div>
          )}

        </div>
      </main>
       <footer className="p-4 border-t">
         <div className="flex items-center gap-2">
            <PhotoUploader onPhotoUpload={handlePhotoUpload} isProcessing={isProcessing} asButton/>
            <Input
                type="text"
                placeholder="Ask Jarvis..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
                disabled={isProcessing}
                className="flex-1"
            />
            <Button onClick={() => handleSendMessage(input)} disabled={isProcessing || !input}>
                <Send size={18}/>
                <span className="sr-only">Send</span>
            </Button>
         </div>
       </footer>
    </div>
  );
}
