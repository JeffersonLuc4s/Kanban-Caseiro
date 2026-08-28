insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'device-transfers',
  'device-transfers',
  false,
  5368709120,
  array['image/*', 'video/*']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "users can view their transfer files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'device-transfers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users can upload their transfer files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'device-transfers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users can update their transfer files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'device-transfers'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'device-transfers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users can delete their transfer files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'device-transfers'
  and (storage.foldername(name))[1] = auth.uid()::text
);
