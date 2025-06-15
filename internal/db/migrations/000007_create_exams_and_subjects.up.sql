-- Step 1: Create subjects table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now (),
    updated_at TIMESTAMP DEFAULT now ()
);

-- Step 2: Create exams table
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subject_id UUID NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT now (),
    updated_at TIMESTAMP DEFAULT now (),
    CONSTRAINT fk_exams_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
);
