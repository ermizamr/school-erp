-- Lesson Plans Table
CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Teaching Materials Table
CREATE TABLE IF NOT EXISTS public.teaching_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    file_type TEXT,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_materials ENABLE ROW LEVEL SECURITY;

-- Lesson Plans RLS
CREATE POLICY "Teachers can view their own lesson plans" 
ON public.lesson_plans FOR SELECT 
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own lesson plans" 
ON public.lesson_plans FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own lesson plans" 
ON public.lesson_plans FOR UPDATE 
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own lesson plans" 
ON public.lesson_plans FOR DELETE 
USING (auth.uid() = teacher_id);

-- Teaching Materials RLS
CREATE POLICY "Teachers can view their own materials" 
ON public.teaching_materials FOR SELECT 
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own materials" 
ON public.teaching_materials FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own materials" 
ON public.teaching_materials FOR UPDATE 
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own materials" 
ON public.teaching_materials FOR DELETE 
USING (auth.uid() = teacher_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_lesson_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lesson_plans_updated_at
    BEFORE UPDATE ON public.lesson_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_lesson_plans_updated_at();
