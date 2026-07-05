-- Grant table access to API roles
GRANT ALL ON TABLE profiles TO authenticated, anon;
GRANT ALL ON TABLE tanks TO authenticated, anon;
GRANT ALL ON TABLE livestock TO authenticated, anon;
GRANT ALL ON TABLE parameter_thresholds TO authenticated, anon;
GRANT ALL ON TABLE parameter_logs TO authenticated, anon;
GRANT ALL ON TABLE parameter_readings TO authenticated, anon;
GRANT ALL ON TABLE alerts TO authenticated, anon;
GRANT ALL ON TABLE maintenance_tasks TO authenticated, anon;
GRANT ALL ON TABLE task_completions TO authenticated, anon;
GRANT ALL ON TABLE notes TO authenticated, anon;

-- Grant execution privileges on RPC functions
GRANT EXECUTE ON FUNCTION check_lockout(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION record_failed_login(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION clear_failed_logins(text) TO anon, authenticated;
