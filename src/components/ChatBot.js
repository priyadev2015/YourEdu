import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../utils/AuthContext';

// Initialize OpenAI client with error handling
let openai;
try {
  if (process.env.REACT_APP_OPENAI_API_KEY && process.env.REACT_APP_OPENAI_API_KEY !== 'DISABLED_FOR_CONTRACTORS') {
    openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }
} catch (error) {
  console.warn('OpenAI client initialization failed:', error);
}

const SYSTEM_PROMPT = `You are a friendly and knowledgeable educational consultant specializing in homeschooling and online education. 

Your responses should be:
1. Brief and focused (2-3 sentences for initial response)
2. Highlight the most important point first
3. Always end by asking if the user would like more specific information about any aspect mentioned

Your knowledge covers:
- Homeschooling regulations and compliance requirements for all 50 US states
- Various homeschooling approaches and curriculum options
- Online and hybrid learning programs
- College preparation for homeschoolers
- Extracurricular and socialization opportunities
- Record-keeping and documentation requirements
- YourEDU platform features and navigation

Example response format:
"[Brief answer to their specific question]

Would you like more details about [relevant aspects]?"

Remember to be conversational but concise. If discussing state requirements, 
specify the state and mention that requirements can change, encouraging 
verification with official sources.`;

const ChatBot = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: openai 
        ? "Hi! I'm your YourEDU assistant. I can help you with questions about homeschooling, compliance, curriculum, and using YourEDU. What would you like to know?"
        : "Chat functionality is currently disabled in the contractor version. Please contact the development team if you need access.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create a new conversation when the chat is opened
  useEffect(() => {
    const createConversation = async () => {
      if (isOpen && user && !currentConversationId) {
        try {
          const { data, error } = await supabase
            .from('chat_conversations')
            .insert([{ user_id: user.id }])
            .select()
            .single();

          if (error) throw error;

          setCurrentConversationId(data.id);

          // Store initial bot message
          await supabase
            .from('chat_messages')
            .insert([{
              conversation_id: data.id,
              role: 'assistant',
              content: messages[0].content
            }]);
        } catch (error) {
          console.error('Error creating conversation:', error);
        }
      }
    };

    createConversation();
  }, [isOpen, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !currentConversationId) return;

    // If OpenAI is disabled, show message
    if (!openai) {
      setMessages(prev => [
        ...prev, 
        { type: 'user', content: inputMessage },
        { type: 'bot', content: "Chat functionality is currently disabled in the contractor version. Please contact the development team if you need access." }
      ]);
      setInputMessage('');
      return;
    }

    // Add user message to UI
    const userMessage = { type: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Store user message in database
      await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: currentConversationId,
          role: 'user',
          content: inputMessage
        }]);

      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Add system prompt
      conversationHistory.unshift({
        role: 'system',
        content: SYSTEM_PROMPT
      });

      // Add user's new message
      conversationHistory.push({
        role: 'user',
        content: inputMessage
      });

      // Get response from OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 500
      });

      // Add bot response to UI
      const botResponse = {
        type: 'bot',
        content: completion.choices[0].message.content
      };
      setMessages(prev => [...prev, botResponse]);

      // Store bot response in database
      await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: currentConversationId,
          role: 'assistant',
          content: botResponse.content
        }]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage = {
        type: 'bot',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
      };
      setMessages(prev => [...prev, errorMessage]);

      // Store error message in database
      try {
        await supabase
          .from('chat_messages')
          .insert([{
            conversation_id: currentConversationId,
            role: 'assistant',
            content: errorMessage.content
          }]);
      } catch (dbError) {
        console.error('Error storing error message:', dbError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load previous messages when conversation ID changes
  useEffect(() => {
    const loadMessages = async () => {
      if (currentConversationId) {
        try {
          const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', currentConversationId)
            .order('created_at', { ascending: true });

          if (error) throw error;

          const formattedMessages = data.map(msg => ({
            type: msg.role === 'user' ? 'user' : 'bot',
            content: msg.content
          }));

          setMessages(formattedMessages);
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      }
    };

    loadMessages();
  }, [currentConversationId]);

  if (!isOpen) return null;

  return (
    <div style={styles.chatContainer}>
      <div style={styles.chatHeader}>
        <h3 style={styles.chatTitle}>YourEDU Assistant</h3>
        <button style={styles.closeButton} onClick={onClose}>×</button>
      </div>
      
      <div style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              ...(message.type === 'user' ? styles.userMessage : styles.botMessage),
            }}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div style={styles.loadingIndicator}>
            <span style={styles.loadingDot}>•</span>
            <span style={styles.loadingDot}>•</span>
            <span style={styles.loadingDot}>•</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} style={styles.inputContainer}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          style={styles.input}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          style={{
            ...styles.sendButton,
            ...(isLoading ? styles.sendButtonDisabled : {})
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  chatContainer: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '350px',
    height: '500px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 53, 107, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: '0 12px 48px rgba(0, 53, 107, 0.16)',
    },
  },
  chatHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00356b',
    borderRadius: '12px 12px 0 0',
  },
  chatTitle: {
    margin: 0,
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0 4px',
    transition: 'opacity 0.2s ease',
    '&:hover': {
      opacity: 0.8,
    },
  },
  messagesContainer: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#f8fafc',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '12px',
    maxWidth: '85%',
    wordWrap: 'break-word',
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  userMessage: {
    backgroundColor: '#00356b',
    color: '#ffffff',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  botMessage: {
    backgroundColor: '#ffffff',
    color: '#2d3748',
    alignSelf: 'flex-start',
    marginRight: 'auto',
    border: '1px solid #e2e8f0',
  },
  inputContainer: {
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    gap: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '0 0 12px 12px',
  },
  input: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#4299e1',
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.15)',
    },
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#00356b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#002548',
      transform: 'translateY(-1px)',
    },
  },
  loadingIndicator: {
    display: 'flex',
    gap: '4px',
    padding: '12px 16px',
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  loadingDot: {
    fontSize: '20px',
    color: '#00356b',
    animation: 'bounce 1.4s infinite ease-in-out',
    animationDelay: 'calc(var(--i) * 0.16s)',
  },
  sendButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    backgroundColor: '#718096',
    '&:hover': {
      backgroundColor: '#718096',
      transform: 'none',
    },
  },
};

export default ChatBot; 