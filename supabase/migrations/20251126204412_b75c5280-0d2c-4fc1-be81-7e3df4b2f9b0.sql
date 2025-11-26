-- Fix storage bucket visibility for CV and NID documents

-- Update CVs bucket to be public so admins can view files
UPDATE storage.buckets 
SET public = true 
WHERE id = 'cvs';

-- Update NID documents bucket to be public so admins can view files
UPDATE storage.buckets 
SET public = true 
WHERE id = 'nid-documents';