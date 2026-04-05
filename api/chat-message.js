const { withMiddleware } = require('./middleware');
const { ObjectId } = require('mongodb');

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text, receiverId, replyToId, forwardedFrom } = req.body;

    // Validate: must have either text or files
    if (!text?.trim()) {
      return res.status(400).json({ message: "Message must contain text" });
    }

    // If staff is sending to a department, verify it's their own
    if (req.user.role === 'staff' && receiverId?.startsWith('department:')) {
      const deptId = receiverId.replace('department:', '');
      const staffUser = await req.db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
      
      if (staffUser?.department?.toString() !== deptId) {
        return res.status(403).json({ message: 'You can only message your own department' });
      }
      
      // Check onlyAdminsCanSend restriction
      const dept = await req.db.collection('departments').findOne({ _id: new ObjectId(deptId) });
      if (dept?.onlyAdminsCanSend) {
        const isGroupAdmin = (dept.groupAdmins || []).map(id => id.toString()).includes(req.user.id.toString());
        if (!isGroupAdmin) {
          return res.status(403).json({ message: 'Only group admins can send messages in this group' });
        }
      }
    }

    let replyTo = null;
    if (replyToId) {
      const original = await req.db.collection('messages').findOne({ _id: new ObjectId(replyToId) });
      if (original) {
        replyTo = {
          messageId: original._id,
          senderName: original.senderName,
          text: original.isDeleted ? 'Message deleted' : (original.text || '').substring(0, 80),
        };
      }
    }

    // Get user details for sender name
    const user = await req.db.collection('users').findOne({ _id: new ObjectId(req.user.id) });

    const messageData = {
      senderId: new ObjectId(req.user.id),
      senderName: user?.name || 'Unknown User',
      senderRole: req.user.role,
      receiverId: receiverId,
      text: text || '',
      files: [],
      replyTo: replyTo || undefined,
      forwardedFrom: forwardedFrom || null,
      createdAt: new Date(),
      readBy: []
    };

    const result = await req.db.collection('messages').insertOne(messageData);
    const msg = { ...messageData, _id: result.insertedId };

    console.log(`[message saved] senderId=${req.user.id} receiverId=${receiverId} text="${msg.text?.substring(0,20)}" files=0`);
    res.json(msg);
    
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: "Error sending message" });
  }
};

module.exports = withMiddleware(handler, { 
  requireAuth: true, 
  requireDb: true 
});