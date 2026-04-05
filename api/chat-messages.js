const { withMiddleware } = require('./middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    let query = {};
    const { userId, departmentId } = req.query;
    const myId = req.user.id.toString();

    if (req.user.role === "admin") {
      if (userId) {
        query = {
          $or: [
            { senderId: new ObjectId(req.user.id), receiverId: userId },
            { senderId: new ObjectId(req.user.id), receiverId: userId.toString() },
            { senderId: new ObjectId(userId), receiverId: myId },
            { senderId: new ObjectId(userId), receiverId: new ObjectId(req.user.id) }
          ]
        };
      } else if (departmentId) {
        query = { receiverId: `department:${departmentId}` };
      }
      // If no filter, show all messages (team chat)
    } else if (req.user.role === "staff") {
      if (userId) {
        query = {
          $or: [
            { senderId: new ObjectId(req.user.id), receiverId: userId },
            { senderId: new ObjectId(req.user.id), receiverId: userId.toString() },
            { senderId: new ObjectId(userId), receiverId: myId },
            { senderId: new ObjectId(userId), receiverId: new ObjectId(req.user.id) }
          ]
        };
      } else if (departmentId) {
        const staffUser = await req.db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
        const staffDeptId = staffUser?.department?.toString();
        if (staffDeptId !== departmentId) {
          return res.status(403).json({ message: 'You can only view your own department chat' });
        }
        query = { receiverId: `department:${departmentId}` };
      } else {
        query = { receiverId: "all" };
      }
    }

    const messages = await req.db.collection('messages')
      .find(query)
      .sort({ createdAt: 1 })
      .limit(100)
      .toArray();

    // Filter disappearing messages for department chats
    let result = messages;
    if (req.query.departmentId) {
      const dept = await req.db.collection('departments').findOne({ _id: new ObjectId(req.query.departmentId) });
      if (dept?.disappearAfterDays > 0) {
        const cutoff = new Date(Date.now() - dept.disappearAfterDays * 24 * 60 * 60 * 1000);
        result = messages.filter(m => new Date(m.createdAt) > cutoff);
      }
    }

    res.json(result);
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireDb: true 
});