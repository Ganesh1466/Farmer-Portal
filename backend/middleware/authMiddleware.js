const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Invalid token format" });
    }

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      console.warn("⚠️ Token verification failed:", error?.message);
      return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }

    // Attach user to request for use in controllers
    req.user = data.user;
    next();

  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
};

module.exports = { verifyUser };