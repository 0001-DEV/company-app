const { withMiddleware } = require('../middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = new ObjectId(req.user.id);
    const projects = await req.db.collection('clientprojects')
      .find({ monitors: userId })
      .sort({ createdAt: -1 })
      .toArray();
      
    // Manually populate monitors since we don't have Mongoose .populate() in Vercel functions
    const populatedProjects = await Promise.all(projects.map(async (project) => {
      const monitorIds = project.monitors || [];
      const monitors = await req.db.collection('users')
        .find({ _id: { $in: monitorIds } })
        .project({ name: 1, email: 1 })
        .toArray();
      return { ...project, monitors };
    }));

    res.json(populatedProjects);
  } catch (error) {
    console.error('Error fetching client projects:', error);
    res.status(500).json({ message: 'Error fetching client projects' });
  }
};

module.exports = withMiddleware(handler, {
  requireAuth: true,
  requireDb: true
});
