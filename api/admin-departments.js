const { withMiddleware } = require('./middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const departments = await req.db.collection('departments')
      .find({})
      .sort({ name: 1 })
      .toArray();
    
    // Get member count for each department
    const departmentsWithMembers = await Promise.all(
      departments.map(async (dept) => {
        // Try both ObjectId and string comparison
        const memberCount = await req.db.collection('users')
          .countDocuments({
            $or: [
              { department: dept._id },
              { department: dept._id.toString() },
              { department: new ObjectId(dept._id) }
            ]
          });
        
        console.log(`Department ${dept.name}: ${memberCount} members`);
        
        return {
          ...dept,
          memberCount
        };
      })
    );
    
    res.json(departmentsWithMembers);
    
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error fetching departments' });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireDb: true 
});