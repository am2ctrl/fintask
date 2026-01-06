// Debug endpoint
export default async (req, res) => {
  try {
    const serverPath = require.resolve('../dist/index.cjs');
    const handler = require(serverPath);
    
    res.status(200).json({
      success: true,
      handler_type: typeof handler,
      message: 'Handler loaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name
    });
  }
};
