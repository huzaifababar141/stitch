-- Enable the pg_cron extension if it is not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the monitor-deadlines edge function to run every 30 minutes
-- We use net.http_post to trigger the function
SELECT cron.schedule('monitor-deadlines', '*/30 * * * *',
  $$ SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/monitor-deadlines',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key'))
  ) $$
);
