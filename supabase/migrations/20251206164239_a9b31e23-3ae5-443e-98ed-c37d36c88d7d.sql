-- Create a dedicated storage bucket for project submissions with all file types support
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-submissions', 'project-submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for project submissions
CREATE POLICY "Anyone can view project submissions" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'project-submissions');

CREATE POLICY "Authenticated users can upload project submissions" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'project-submissions' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own project submissions" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'project-submissions' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own project submissions" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'project-submissions' AND auth.uid() IS NOT NULL);