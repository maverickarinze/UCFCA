-- Let recorders delete members (e.g. duplicates or entries added by mistake).
-- Deleting cascades to the member's attendance, PIN and remembered phones; the
-- officer area recommends deactivating real members instead, to keep history.
create policy "Recorders can delete members"
  on public.members for delete to authenticated
  using (public.current_officer_role() = 'recorder');
