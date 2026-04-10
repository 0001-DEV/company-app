module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  res.status(200).json({
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI_SET: !!process.env.MONGODB_URI,
    MONGODB_URI_PREVIEW: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 60) + '...' : 'NOT SET',
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
    ALL_ENV_KEYS: Object.keys(process.env).filter(k => !k.includes('PATH')).sort()
  });
};
