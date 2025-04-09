-- Create course_materials table
CREATE TABLE IF NOT EXISTS course_materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES youredu_courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'syllabus', 'readings', 'problem_sets', 'lecture_notes', 'supplemental'
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create work_samples table
CREATE TABLE IF NOT EXISTS work_samples (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES youredu_courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    ai_review_requested BOOLEAN DEFAULT false,
    ai_review_completed BOOLEAN DEFAULT false,
    ai_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS course_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES youredu_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'essay', 'problem_set', 'project', etc.
    due_date TIMESTAMPTZ,
    points INTEGER,
    instructions TEXT,
    attachments TEXT[], -- Array of file paths
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assignment_submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES course_assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'submitted', -- 'draft', 'submitted', 'resubmitted', 'graded'
    files TEXT[], -- Array of file paths
    comment TEXT,
    grade NUMERIC,
    feedback TEXT,
    graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    graded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_course_materials_course_id ON course_materials(course_id);
CREATE INDEX idx_work_samples_course_id ON work_samples(course_id);
CREATE INDEX idx_work_samples_student_id ON work_samples(student_id);
CREATE INDEX idx_course_assignments_course_id ON course_assignments(course_id);
CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON assignment_submissions(student_id);

-- Create triggers for updated_at
CREATE TRIGGER course_materials_updated_at
    BEFORE UPDATE ON course_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER work_samples_updated_at
    BEFORE UPDATE ON work_samples
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER course_assignments_updated_at
    BEFORE UPDATE ON course_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER assignment_submissions_updated_at
    BEFORE UPDATE ON assignment_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for course_materials
CREATE POLICY "Users can view course materials"
    ON course_materials FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM youredu_courses c
            WHERE c.id = course_id
            AND (
                c.creator_id = auth.uid() OR 
                auth.uid() = ANY(c.teachers) OR
                EXISTS (
                    SELECT 1 FROM students 
                    WHERE id = c.student_id 
                    AND (parent_id = auth.uid() OR user_id = auth.uid())
                )
            )
        )
    );

CREATE POLICY "Teachers can manage course materials"
    ON course_materials FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM youredu_courses c
            WHERE c.id = course_id
            AND (c.creator_id = auth.uid() OR auth.uid() = ANY(c.teachers))
        )
    );

-- Create policies for work_samples
CREATE POLICY "Users can view their work samples"
    ON work_samples FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM students
            WHERE id = student_id
            AND (parent_id = auth.uid() OR user_id = auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM youredu_courses c
            WHERE c.id = course_id
            AND (c.creator_id = auth.uid() OR auth.uid() = ANY(c.teachers))
        )
    );

CREATE POLICY "Students can manage their work samples"
    ON work_samples FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM students
            WHERE id = student_id
            AND (parent_id = auth.uid() OR user_id = auth.uid())
        )
    );

-- Create policies for course_assignments
CREATE POLICY "Users can view course assignments"
    ON course_assignments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM youredu_courses c
            WHERE c.id = course_id
            AND (
                c.creator_id = auth.uid() OR 
                auth.uid() = ANY(c.teachers) OR
                EXISTS (
                    SELECT 1 FROM students 
                    WHERE id = c.student_id 
                    AND (parent_id = auth.uid() OR user_id = auth.uid())
                )
            )
        )
    );

CREATE POLICY "Teachers can manage course assignments"
    ON course_assignments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM youredu_courses c
            WHERE c.id = course_id
            AND (c.creator_id = auth.uid() OR auth.uid() = ANY(c.teachers))
        )
    );

-- Create policies for assignment_submissions
CREATE POLICY "Users can view relevant submissions"
    ON assignment_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM students
            WHERE id = student_id
            AND (parent_id = auth.uid() OR user_id = auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM course_assignments a
            JOIN youredu_courses c ON a.course_id = c.id
            WHERE a.id = assignment_id
            AND (c.creator_id = auth.uid() OR auth.uid() = ANY(c.teachers))
        )
    );

CREATE POLICY "Students can manage their submissions"
    ON assignment_submissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM students
            WHERE id = student_id
            AND (parent_id = auth.uid() OR user_id = auth.uid())
        )
    );

CREATE POLICY "Teachers can grade submissions"
    ON assignment_submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM course_assignments a
            JOIN youredu_courses c ON a.course_id = c.id
            WHERE a.id = assignment_id
            AND (c.creator_id = auth.uid() OR auth.uid() = ANY(c.teachers))
        )
    ); 