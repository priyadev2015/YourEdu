-- Drop table if exists
DROP TABLE IF EXISTS account_profiles;

-- Create account_profiles table
CREATE TABLE account_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT,
    email TEXT,
    age INTEGER,
    education_level TEXT,
    street_address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    timezone TEXT,
    phone_number TEXT,
    profile_picture TEXT,
    account_type TEXT DEFAULT 'Parent',
    account_status TEXT DEFAULT 'Active',
    interests TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS)
ALTER TABLE account_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own account profile"
    ON account_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own account profile"
    ON account_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own account profile"
    ON account_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create index for faster lookups
CREATE INDEX account_profiles_account_type_idx ON account_profiles(account_type);
CREATE INDEX account_profiles_account_status_idx ON account_profiles(account_status);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_account()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.account_profiles (id, name, email, account_type, account_status, interests)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'Parent',
    'Active',
    '{}'::TEXT[]
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_account ON auth.users;
CREATE TRIGGER on_auth_user_created_account
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_account(); 