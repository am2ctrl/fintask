// Simple test endpoint to verify Vercel function works
module.exports = async (req, res) => {
  res.status(200).json({
    message: 'Vercel function is working!',
    timestamp: new Date().toISOString(),
    env_check: {
      has_supabase_url: !!process.env.SUPABASE_URL,
      has_session_secret: !!process.env.SESSION_SECRET,
      node_env: process.env.NODE_ENV,
      vercel: process.env.VERCEL
    }
  });
};
