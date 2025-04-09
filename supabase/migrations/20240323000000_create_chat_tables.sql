-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX chat_conversations_user_id_idx ON public.chat_conversations(user_id);
CREATE INDEX chat_messages_conversation_id_idx ON public.chat_messages(conversation_id);

-- Create policies for chat_conversations
CREATE POLICY "Users can view their own conversations"
    ON public.chat_conversations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
    ON public.chat_conversations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create policies for chat_messages
CREATE POLICY "Users can view messages from their conversations"
    ON public.chat_messages FOR SELECT
    TO authenticated
    USING (
        conversation_id IN (
            SELECT id FROM public.chat_conversations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to their conversations"
    ON public.chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM public.chat_conversations 
            WHERE user_id = auth.uid()
        )
    );

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_chat_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_conversations 
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation timestamp when new message is added
CREATE TRIGGER update_chat_conversation_timestamp
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_conversation_timestamp(); 