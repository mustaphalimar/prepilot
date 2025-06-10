CREATE TABLE study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    exam_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT now (),
    updated_at TIMESTAMP DEFAULT now ()
);

CREATE TABLE study_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    plan_id UUID REFERENCES study_plans (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 0, -- 0=low, 1=medium, 2=high
    notes TEXT,
    created_at TIMESTAMP DEFAULT now (),
    updated_at TIMESTAMP DEFAULT now ()
);
