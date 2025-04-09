





-- Enable Row Level Security
ALTER TABLE ny_compliance_forms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own compliance forms"
    ON ny_compliance_forms
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own compliance forms"
    ON ny_compliance_forms
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compliance forms"
    ON ny_compliance_forms
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_ny_compliance_forms_user_id ON ny_compliance_forms(user_id);
CREATE INDEX idx_ny_compliance_forms_status ON ny_compliance_forms(status);
CREATE INDEX idx_ny_compliance_forms_submitted_at ON ny_compliance_forms(submitted_at);
