const { withMiddleware } = require('./middleware');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log("Fetching users list for:", req.user.role);
    
    if (req.user.role === "admin") {
      // Admin sees all staff members
      let staff = await req.db.collection('users')
        .find({ role: "staff" })
        .project({ name: 1, email: 1, role: 1, profilePicture: 1 })
        .toArray();
      
      if (staff.length === 0) {
        staff = await req.db.collection('users')
          .find({ role: { $ne: "admin" } })
          .project({ name: 1, email: 1, role: 1, profilePicture: 1 })
          .toArray();
        console.log("No staff with role='staff', fetching all non-admin users:", staff.length);
      }
      
      console.log("Found staff for admin:", staff.length);
      res.json(staff);
      
    } else if (req.user.role === "staff") {
      // Staff sees admin and other staff members
      const users = await req.db.collection('users')
        .find({ 
          $or: [
            { role: "admin" },
            { role: "staff", _id: { $ne: req.user.id } }
          ]
        })
        .project({ name: 1, email: 1, role: 1, profilePicture: 1 })
        .toArray();
      
      console.log("Found users for staff:", users.length);
      res.json(users);
      
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
    
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireDb: true 
});