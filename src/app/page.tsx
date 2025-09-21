
'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { JarvisHeader } from '@/components/jarvis/jarvis-header';
import { PhotoUploader } from '@/components/jarvis/photo-uploader';
import { ResultsDisplay } from '@/components/jarvis/results-display';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppState, ScannedItem } from '@/context/app-state-context';
import { jarvisChat } from '@/ai/flows/jarvis-chat';
import { JarvisChatRequest, Message } from '@/ai/flows/jarvis-chat-types';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BrainCircuit, User } from 'lucide-react';
import { HistoryView } from '@/components/jarvis/history-view';

export default function Home() {
  const { addScannedItem, billItems, ticketItems, documentItems } = useAppState();
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
  }, [messages, isProcessing]);


  const handleSendMessage = async (text: string, photoDataUri?: string) => {
    if (!text && !photoDataUri) return;

    const userMessage: Message = { role: 'user', content: [] };
    if (text) {
        userMessage.content.push({ text });
    }
    if (photoDataUri) {
      userMessage.content.push({ media: { url: photoDataUri } });
      if (!text) {
        userMessage.content.unshift({ text: "Analyze this photo" });
      }
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

      const { response, scannedItem, historyCategory } = await jarvisChat(chatRequest);

      setMessages((prev) => [...prev, response]);

      if (scannedItem) {
        setActiveScannedItem(scannedItem);
        addScannedItem(scannedItem);
      }
      if(historyCategory) {
        if(historyCategory.includes('bills')) {
            setHistoryItems(billItems);
        } else if (historyCategory.includes('tickets')) {
            setHistoryItems(ticketItems);
        } else if (historyCategory.includes('documents')) {
            setHistoryItems(documentItems);
        }
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
      handleSendMessage('', dataUri);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setActiveScannedItem(null);
    setHistoryItems([]);
  };

  const showChat = messages.length > 0 || isProcessing || activeScannedItem || historyItems.length > 0;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground antialiased w-full max-w-md mx-auto">
      <JarvisHeader />
      <main className="flex-1 flex flex-col p-4 overflow-y-auto" ref={scrollRef}>
        <AnimatePresence mode="wait">
        {!showChat ? (
             <motion.div
                key="uploader"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <PhotoUploader onPhotoUpload={handlePhotoUpload} isProcessing={isProcessing}/>
             </motion.div>
        ) : (
            <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col space-y-4"
            >
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
            </motion.div>
        )}
        </AnimatePresence>
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
