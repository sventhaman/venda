-- ichiba: Storage for listing photos.
-- Public read-only bucket. Path convention: {auth.uid()}/{filename}.
-- RLS allows uploads only under the uploader's own folder.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "listing-images public read"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "listing-images owner insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "listing-images owner update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "listing-images owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
