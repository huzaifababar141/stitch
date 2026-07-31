-- Enable replication for specific tables to use Supabase Realtime
-- Creating a publication or altering the default one

-- By default, Supabase creates a 'supabase_realtime' publication
-- We just need to add our tables to it.

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
