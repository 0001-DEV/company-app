import { useState, useEffect } from "react";

const ChatBox = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState("all");
  const [staffLoading, setStaffLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDepartments, setShowDepartments] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [editingMessage, setEditingMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [lastMessageId, setLastMessageId] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in first to use chat");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/chat/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data);
        } else {
          const errorData = await response.json();
          setError(`Authentication failed: ${errorData.message || 'Unknown error'}`);
        }
      } catch (err) {
        setError(`Error connecting to server: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchStaffList = async () => {
      setStaffLoading(true);
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching staff list for user:", currentUser);
        const response = await fetch("http://localhost:5000/api/chat/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Staff list response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Staff list data:", data);
          setStaffList(data);
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch staff list:", errorData);
        }
      } catch (err) {
        console.error("Error loading staff list:", err);
      } finally {
        setStaffLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching departments...");
        const response = await fetch("http://localhost:5000/api/admin/fixed-departments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Departments response status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("Departments data:", data);
          console.log("Number of departments:", data.length);
          setDepartments(data);
        }
      } catch (err) {
        console.error("Error loading departments:", err);
      }
    };

    fetchStaffList();
    fetchDepartments();
  }, [currentUser]);

  // Fetch unread message counts
  useEffect(() => {
    if (!currentUser) return;

    const fetchUnreadCounts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/chat/unread-counts", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUnreadCounts(data);
        }
      } catch (err) {
        console.error("Error fetching unread counts:", err);
      }
    };

    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Fetch last messages for sorting
  useEffect(() => {
    if (!currentUser) return;

    const fetchLastMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/chat/last-messages", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setLastMessages(data);
        }
      } catch (err) {
        console.error("Error fetching last messages:", err);
      }
    };

    fetchLastMessages();
    const interval = setInterval(fetchLastMessages, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check for new messages and show notifications
  useEffect(() => {
    if (!currentUser) return;

    let previousMessageCount = messages.length;

    const checkNewMessages = () => {
      if (messages.length > previousMessageCount) {
        const newMessage = messages[messages.length - 1];
        
        // Only notify if message is from someone else
        if (newMessage.senderId !== currentUser.id) {
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New message from ${newMessage.senderName}`, {
              body: newMessage.text,
              icon: '/logo192.png',
              tag: 'chat-notification'
            });
          }
        }
      }
      previousMessageCount = messages.length;
    };

    checkNewMessages();
  }, [messages, currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const loadMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        let url = "http://localhost:5000/api/chat/messages";
        
        // If viewing private chat with selected user
        if (viewMode === "private" && selectedUser) {
          url += `?userId=${selectedUser._id}`;
        } else if (viewMode === "department" && selectedDepartment) {
          url += `?departmentId=${selectedDepartment._id}`;
        }

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [currentUser, selectedUser, viewMode, selectedDepartment]);

  const sendMessage = async () => {
    if (!text.trim() && selectedFiles.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      let receiverId = "all";
      
      if (viewMode === "private" && selectedUser) {
        receiverId = selectedUser._id;
      } else if (viewMode === "department" && selectedDepartment) {
        receiverId = `department:${selectedDepartment._id}`;
      }

      const formData = new FormData();
      formData.append('text', text);
      formData.append('receiverId', receiverId);
      
      // Add files to form data
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch("http://localhost:5000/api/chat/message", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setText("");
        setSelectedFiles([]);
        let url = "http://localhost:5000/api/chat/messages";
        if (viewMode === "private" && selectedUser) {
          url += `?userId=${selectedUser._id}`;
        } else if (viewMode === "department" && selectedDepartment) {
          url += `?departmentId=${selectedDepartment._id}`;
        }
        
        const messagesResponse = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (messagesResponse.ok) {
          const data = await messagesResponse.json();
          setMessages(data);
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to send message: ${errorData.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const startPrivateChat = (staff) => {
    setSelectedUser(staff);
    setSelectedDepartment(null);
    setViewMode("private");
    markAsRead(staff._id);
  };

  const startDepartmentChat = (dept) => {
    setSelectedDepartment(dept);
    setSelectedUser(null);
    setViewMode("department");
  };

  const backToTeamChat = () => {
    setSelectedUser(null);
    setSelectedDepartment(null);
    setViewMode("all");
  };

  // Generate different background colors for each contact
  const getContactColor = (index) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Cyan
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Orange
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Teal
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pastel
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Rose
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Peach
      'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', // Coral
    ];
    return colors[index % colors.length];
  };

  const markAsRead = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/chat/messages/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      
      setUnreadCounts(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleMessageClick = (message, event) => {
    event.stopPropagation();
    console.log('Message clicked:', message);
    console.log('Current user ID:', currentUser.id);
    console.log('Message sender ID:', message.senderId);
    console.log('Is deleted:', message.isDeleted);
    
    if (message.senderId === currentUser.id && !message.isDeleted) {
      console.log('Setting context menu');
      setContextMenu({ messageId: message._id, text: message.text });
    } else {
      console.log('Cannot edit - not your message or deleted');
    }
  };

  const editMessage = () => {
    console.log('Edit message called', contextMenu);
    if (contextMenu) {
      setEditingMessage(contextMenu.messageId);
      setText(contextMenu.text);
      setContextMenu(null);
      console.log('Editing message:', contextMenu.messageId);
    }
  };

  const deleteMessage = async () => {
    console.log('Delete message called', contextMenu);
    if (!contextMenu) return;
    
    if (!window.confirm("Are you sure you want to delete this message?")) {
      setContextMenu(null);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log('Deleting message:', contextMenu.messageId);
      const response = await fetch(`http://localhost:5000/api/chat/messages/${contextMenu.messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Delete response status:', response.status);
      const responseData = await response.json();
      console.log('Delete response:', responseData);

      if (response.ok) {
        alert('Message deleted successfully!');
        setContextMenu(null);
        // Reload messages
        let url = "http://localhost:5000/api/chat/messages";
        if (viewMode === "private" && selectedUser) {
          url += `?userId=${selectedUser._id}`;
        } else if (viewMode === "department" && selectedDepartment) {
          url += `?departmentId=${selectedDepartment._id}`;
        }
        
        const messagesResponse = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (messagesResponse.ok) {
          const data = await messagesResponse.json();
          setMessages(data);
        }
      } else {
        alert(`Failed to delete: ${responseData.message}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert("Error deleting message: " + err.message);
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const updateMessage = async () => {
    if (!editingMessage || !text.trim()) return;

    console.log('Updating message:', editingMessage, 'with text:', text);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/chat/messages/${editingMessage}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      console.log('Update response status:', response.status);
      const responseData = await response.json();
      console.log('Update response:', responseData);

      if (response.ok) {
        alert('Message updated successfully!');
        setText("");
        setEditingMessage(null);
        
        // Reload messages
        let url = "http://localhost:5000/api/chat/messages";
        if (viewMode === "private" && selectedUser) {
          url += `?userId=${selectedUser._id}`;
        } else if (viewMode === "department" && selectedDepartment) {
          url += `?departmentId=${selectedDepartment._id}`;
        }
        
        const messagesResponse = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (messagesResponse.ok) {
          const data = await messagesResponse.json();
          setMessages(data);
        }
      } else {
        alert(`Failed to update: ${responseData.message}`);
      }
    } catch (err) {
      console.error('Update error:', err);
      alert("Error updating message: " + err.message);
    }
  };

  const handleSendOrUpdate = () => {
    if (editingMessage) {
      updateMessage();
    } else {
      sendMessage();
    }
  };
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <h3 style={styles.loadingText}>Loading chat...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorBox}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>Unable to Load Chat</h2>
          <p style={styles.errorMessage}>{error}</p>
          <p style={styles.errorHint}>Make sure you're logged in and the backend server is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>💬</div>
          <div>
            <h2 style={styles.headerTitle}>Team Chat</h2>
            <p style={styles.headerSubtitle}>
              {viewMode === "all" ? "Team Communication" : 
               viewMode === "department" ? `${selectedDepartment?.name} Department` :
               `Private chat with ${selectedUser?.name}`}
            </p>
          </div>
        </div>
        <div style={styles.userBadge}>
          <div style={styles.avatar}>{currentUser?.role === "admin" ? "👑" : "👤"}</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{currentUser?.name}</div>
            <div style={styles.userRole}>
              {currentUser?.role === "admin" ? "Administrator" : "Staff Member"}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.mainLayout}>
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>
            {currentUser?.role === "admin" ? "Team Members" : "Contacts"}
          </h3>
          
          {/* Debug Info */}
          {currentUser?.role === "admin" && (
            <div style={{ padding: '10px', background: '#1a1a1a', color: '#93c5fd', fontSize: '12px', borderBottom: '1px solid #1e40af' }}>
              Staff: {staffList.length} | Departments: {departments.length} | Loading: {staffLoading ? 'Yes' : 'No'}
            </div>
          )}
          
          {/* Team Chat Button */}
          {currentUser?.role === "admin" && (
            <div
              style={{
                ...styles.staffItem,
                background: viewMode === "all" ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                ...(viewMode === "all" ? styles.staffItemActive : {}),
              }}
              onClick={backToTeamChat}
            >
              <div style={styles.teamAvatar}>👥</div>
              <div style={styles.staffInfo}>
                <div style={styles.staffName}>Team Chat</div>
                <div style={styles.staffEmail}>All staff members</div>
              </div>
            </div>
          )}

          {/* Admin Chat Button for Staff */}
          {currentUser?.role === "staff" && (
            <>
              <div
                style={{
                  ...styles.staffItem,
                  background: viewMode === "all" ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  ...(viewMode === "all" ? styles.staffItemActive : {}),
                }}
                onClick={backToTeamChat}
              >
                <div style={styles.teamAvatar}>👥</div>
                <div style={styles.staffInfo}>
                  <div style={styles.staffName}>Team Chat</div>
                  <div style={styles.staffEmail}>All staff members</div>
                </div>
              </div>
              
              {staffList.filter(s => s.role === 'admin').map((admin) => (
                <div
                  key={admin._id}
                  style={{
                    ...styles.staffItem,
                    background: viewMode === "private" && selectedUser?._id === admin._id 
                      ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
                      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    ...(viewMode === "private" && selectedUser?._id === admin._id ? styles.staffItemActive : {}),
                  }}
                  onClick={() => startPrivateChat(admin)}
                >
                  <div style={styles.adminAvatar}>👨‍💼</div>
                  <div style={styles.staffInfo}>
                    <div style={styles.staffName}>💬 Chat with Admin</div>
                    <div style={styles.staffEmail}>{admin.name}</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Departments Dropdown */}
          {currentUser?.role === "admin" && departments.length > 0 && (
            <>
              <div 
                style={{
                  ...styles.staffItem,
                  cursor: 'pointer',
                  background: showDepartments 
                    ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' 
                    : 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
                }}
                onClick={() => setShowDepartments(!showDepartments)}
              >
                <div style={styles.deptAvatar}>🏢</div>
                <div style={styles.staffInfo}>
                  <div style={styles.staffName}>Departments</div>
                  <div style={styles.staffEmail}>{departments.length} departments</div>
                </div>
                <div style={{ fontSize: '20px', color: '#ffffff' }}>
                  {showDepartments ? '▼' : '▶'}
                </div>
              </div>
              
              {showDepartments && (
                <>
                  {console.log("Rendering departments dropdown, count:", departments.length)}
                  {console.log("Departments array:", departments)}
                  {departments.map((dept, index) => {
                    console.log(`Rendering department ${index}:`, dept.name);
                    return (
                      <div
                        key={dept._id}
                        style={{
                          ...styles.staffItem,
                          paddingLeft: '30px',
                          background: viewMode === "department" && selectedDepartment?._id === dept._id 
                            ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
                            : getContactColor(index + 100),
                          ...(viewMode === "department" && selectedDepartment?._id === dept._id ? styles.staffItemActive : {}),
                        }}
                        onClick={() => startDepartmentChat(dept)}
                      >
                        <div style={{ ...styles.deptAvatar, width: '35px', height: '35px', fontSize: '18px' }}>🏢</div>
                        <div style={styles.staffInfo}>
                          <div style={styles.staffName}>{dept.name}</div>
                          <div style={styles.staffEmail}>Department chat</div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}

          {/* Staff List */}
          <div style={styles.staffList}>
            {currentUser?.role === "staff" && (
              <div style={styles.staffItem}>
                <div style={styles.adminAvatar}>�</div>
                <div style={styles.staffInfo}>
                  <div style={styles.staffName}>Admin</div>
                  <div style={styles.staffEmail}>Administrator</div>
                </div>
              </div>
            )}

            {currentUser?.role === "admin" && (
              <>
                {staffLoading ? (
                  <p style={styles.noStaff}>Loading staff...</p>
                ) : staffList.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={styles.noStaff}>No staff members found</p>
                    <p style={{ ...styles.noStaff, fontSize: '12px', marginTop: '10px' }}>
                      Create staff members from the Admin Dashboard
                    </p>
                  </div>
                ) : (
                  staffList
                    .sort((a, b) => {
                      // First sort by unread messages
                      const aUnread = unreadCounts[a._id] || 0;
                      const bUnread = unreadCounts[b._id] || 0;
                      if (bUnread !== aUnread) return bUnread - aUnread;
                      
                      // Then sort by last message time
                      const aLastMsg = lastMessages[a._id];
                      const bLastMsg = lastMessages[b._id];
                      if (aLastMsg && bLastMsg) {
                        return new Date(bLastMsg.createdAt) - new Date(aLastMsg.createdAt);
                      }
                      if (aLastMsg) return -1;
                      if (bLastMsg) return 1;
                      return 0;
                    })
                    .map((staff, index) => (
                    <div
                      key={staff._id}
                      style={{
                        ...styles.staffItem,
                        background: viewMode === "private" && selectedUser?._id === staff._id 
                          ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
                          : getContactColor(index),
                        ...(viewMode === "private" && selectedUser?._id === staff._id ? styles.staffItemActive : {}),
                      }}
                      onClick={() => startPrivateChat(staff)}
                    >
                      <div style={styles.staffAvatar}>👤</div>
                      <div style={styles.staffInfo}>
                        <div style={styles.staffName}>{staff.name}</div>
                        <div style={styles.staffEmail}>
                          {lastMessages[staff._id] ? (
                            <span style={{ fontSize: '11px', color: '#ffffff' }}>
                              {lastMessages[staff._id].text.substring(0, 30)}...
                            </span>
                          ) : staff.email}
                        </div>
                      </div>
                      {unreadCounts[staff._id] > 0 && (
                        <div style={styles.unreadBadge}>
                          <div style={styles.greenDot}></div>
                          <span style={styles.unreadCount}>{unreadCounts[staff._id]}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        <div style={styles.chatContainer}>
          <div style={styles.chatHeader}>
            {viewMode === "all" ? (
              <>
                <div style={styles.chatHeaderAvatar}>👥</div>
                <div>
                  <div style={styles.chatHeaderName}>Team Chat</div>
                  <div style={styles.chatHeaderEmail}>Everyone can see these messages</div>
                </div>
              </>
            ) : viewMode === "department" ? (
              <>
                <button style={styles.backButton} onClick={backToTeamChat}>
                  ← Back
                </button>
                <div style={styles.chatHeaderAvatar}>🏢</div>
                <div>
                  <div style={styles.chatHeaderName}>{selectedDepartment?.name}</div>
                  <div style={styles.chatHeaderEmail}>Department members only</div>
                </div>
              </>
            ) : (
              <>
                {viewMode === "private" && selectedUser && (
                  <>
                    <button style={styles.backButton} onClick={backToTeamChat}>
                      ← Back
                    </button>
                    <div style={styles.chatHeaderAvatar}>👤</div>
                    <div>
                      <div style={styles.chatHeaderName}>{selectedUser.name}</div>
                      <div style={styles.chatHeaderEmail}>Private conversation</div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div style={styles.messagesArea}>
            {messages.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>💭</div>
                <h3 style={styles.emptyTitle}>No messages yet</h3>
                <p style={styles.emptyText}>Start the conversation by sending a message below</p>
              </div>
            ) : (
              <div style={styles.messagesList}>
                {messages.map((msg, index) => {
                  const isOwnMessage = msg.senderId === currentUser?.id;
                  const isAdmin = msg.senderRole === "admin";
                  const messageAge = (new Date() - new Date(msg.createdAt)) / (1000 * 60); // in minutes
                  const canEdit = isOwnMessage && !msg.isDeleted && messageAge <= 5;
                  
                  return (
                    <div
                      key={index}
                      style={{
                        ...styles.messageWrapper,
                        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                      }}
                    >
                      {!isOwnMessage && (
                        <div style={styles.messageAvatar}>{isAdmin ? "👑" : "👤"}</div>
                      )}
                      
                      <div 
                        style={{
                          ...styles.messageBubble,
                          ...(isOwnMessage ? styles.ownMessage : styles.otherMessage),
                          ...(msg.isDeleted ? styles.deletedMessage : {}),
                          cursor: canEdit ? 'pointer' : 'default',
                          position: 'relative',
                          border: canEdit ? '2px solid transparent' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={(e) => canEdit && handleMessageClick(msg, e)}
                        onMouseEnter={(e) => {
                          if (canEdit) {
                            e.currentTarget.style.border = '2px solid #60a5fa';
                            e.currentTarget.style.transform = 'scale(1.02)';
                            const hint = e.currentTarget.querySelector('[data-hint]');
                            if (hint) hint.style.opacity = '1';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (canEdit) {
                            e.currentTarget.style.border = '2px solid transparent';
                            e.currentTarget.style.transform = 'scale(1)';
                            const hint = e.currentTarget.querySelector('[data-hint]');
                            if (hint) hint.style.opacity = '0';
                          }
                        }}
                      >
                        {canEdit && (
                          <div style={styles.editHint} data-hint="true">
                            Click to edit/delete ({Math.max(0, Math.floor(5 - messageAge))}m left)
                          </div>
                        )}
                        {!isOwnMessage && (
                          <div style={styles.senderName}>
                            {msg.senderName || "Unknown"}
                            {isAdmin && <span style={styles.adminBadge}>Admin</span>}
                          </div>
                        )}
                        <div style={styles.messageText}>
                          {msg.text}
                          {msg.isEdited && !msg.isDeleted && (
                            <span style={styles.editedLabel}> (edited)</span>
                          )}
                        </div>
                        
                        {msg.files && msg.files.length > 0 && (
                          <div style={styles.fileAttachments}>
                            {msg.files.map((file, idx) => (
                              <a
                                key={idx}
                                href={`http://localhost:5000/${file.path}`}
                                download
                                style={styles.fileAttachment}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                📎 {file.originalName}
                              </a>
                            ))}
                          </div>
                        )}
                        
                        <div style={styles.messageTime}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        
                        {contextMenu && contextMenu.messageId === msg._id && (
                          <div style={styles.contextMenu} onClick={(e) => e.stopPropagation()}>
                            <button 
                              style={styles.contextButton} 
                              onClick={(e) => {
                                e.stopPropagation();
                                editMessage();
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              style={{...styles.contextButton, background: '#ef4444'}} 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMessage();
                              }}
                            >
                              🗑️ Delete
                            </button>
                            <button 
                              style={styles.contextButton} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setContextMenu(null);
                              }}
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      {isOwnMessage && (
                        <div style={styles.messageAvatar}>
                          {currentUser?.role === "admin" ? "👑" : "👤"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={styles.inputArea}>
            {selectedFiles.length > 0 && (
              <div style={styles.selectedFilesPreview}>
                {selectedFiles.map((file, idx) => (
                  <div key={idx} style={styles.filePreviewItem}>
                    <span>📎 {file.name}</span>
                    <button
                      onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                      style={styles.removeFileButton}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div style={styles.inputContainer}>
              <div style={styles.fileUploadButton}>
                <label htmlFor="chat-file-upload" style={styles.fileUploadLabel}>
                  📎
                </label>
                <input
                  id="chat-file-upload"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setSelectedFiles([...selectedFiles, ...files]);
                  }}
                  style={{ display: 'none' }}
                />
              </div>
              
              <input
                type="text"
                value={text}
                placeholder="Type your message..."
                style={styles.input}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOrUpdate()}
              />
              {editingMessage && (
                <button 
                  onClick={() => {
                    setEditingMessage(null);
                    setText('');
                  }} 
                  style={{...styles.sendButton, background: '#6b7280', marginRight: '10px'}}
                >
                  Cancel
                </button>
              )}
              <button onClick={handleSendOrUpdate} style={styles.sendButton} disabled={!text.trim() && selectedFiles.length === 0}>
                <span style={styles.sendIcon}>{editingMessage ? '✏️' : '📤'}</span>
                {editingMessage ? 'Update' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: { minHeight: "100vh", maxHeight: "100vh", background: "linear-gradient(135deg, #1e3a8a 0%, #000000 100%)", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", overflow: "hidden" },
  header: { background: "rgba(0, 0, 0, 0.95)", backdropFilter: "blur(10px)", padding: "20px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 20px rgba(30, 58, 138, 0.3)", borderBottom: "2px solid #1e40af" },
  headerLeft: { display: "flex", alignItems: "center", gap: "15px" },
  headerIcon: { fontSize: "40px" },
  headerTitle: { margin: 0, fontSize: "24px", color: "#ffffff", fontWeight: "700" },
  headerSubtitle: { margin: "5px 0 0 0", fontSize: "14px", color: "#93c5fd" },
  userBadge: { display: "flex", alignItems: "center", gap: "12px", background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", padding: "10px 20px", borderRadius: "50px", color: "white", boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)" },
  avatar: { width: "45px", height: "45px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", border: "2px solid rgba(255, 255, 255, 0.3)" },
  userInfo: { display: "flex", flexDirection: "column" },
  userName: { fontWeight: "600", fontSize: "16px" },
  userRole: { fontSize: "12px", opacity: 0.9 },
  mainLayout: { flex: 1, display: "flex", maxWidth: "1400px", width: "100%", margin: "20px auto", gap: "20px", padding: "0 20px", overflow: "hidden", minHeight: 0 },
  sidebar: { width: "300px", background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", borderRadius: "20px", boxShadow: "0 20px 60px rgba(30, 58, 138, 0.5)", overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid #1e40af", maxHeight: "100%" },
  sidebarTitle: { padding: "20px", margin: 0, background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", color: "white", fontSize: "18px", fontWeight: "600" },
  staffList: { flex: 1, overflowY: "auto", padding: "10px" },
  noStaff: { textAlign: "center", color: "#93c5fd", padding: "20px" },
  staffItem: { display: "flex", alignItems: "center", gap: "12px", padding: "15px", borderRadius: "12px", cursor: "pointer", transition: "all 0.3s ease", marginBottom: "8px", border: "1px solid transparent" },
  staffItemActive: { background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", color: "white", border: "1px solid #60a5fa" },
  staffAvatar: { width: "45px", height: "45px", borderRadius: "50%", background: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0, border: "2px solid #3b82f6" },
  teamAvatar: { width: "45px", height: "45px", borderRadius: "50%", background: "#1e40af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0, border: "2px solid #60a5fa" },
  deptAvatar: { width: "45px", height: "45px", borderRadius: "50%", background: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0, border: "2px solid #10b981" },
  adminAvatar: { width: "45px", height: "45px", borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0, border: "2px solid #93c5fd" },
  staffInfo: { flex: 1, minWidth: 0 },
  staffName: { fontWeight: "600", fontSize: "15px", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#ffffff" },
  staffEmail: { fontSize: "12px", opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#93c5fd" },
  chatContainer: { flex: 1, display: "flex", flexDirection: "column", background: "#000000", borderRadius: "20px", boxShadow: "0 20px 60px rgba(30, 58, 138, 0.5)", overflow: "hidden", border: "1px solid #1e40af", maxHeight: "100%" },
  chatHeader: { padding: "20px 30px", background: "#0a0a0a", borderBottom: "2px solid #1e40af", display: "flex", alignItems: "center", gap: "15px" },
  chatHeaderAvatar: { width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", color: "white" },
  chatHeaderName: { fontSize: "18px", fontWeight: "600", color: "#ffffff" },
  chatHeaderEmail: { fontSize: "14px", color: "#93c5fd" },
  chatHeaderPlaceholder: { fontSize: "16px", color: "#93c5fd", fontStyle: "italic" },
  backButton: { padding: "8px 16px", background: "#1e40af", color: "#ffffff", border: "1px solid #3b82f6", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600", marginRight: "15px", transition: "all 0.3s ease" },
  messagesArea: { flex: 1, overflowY: "auto", padding: "30px", background: "#0a0a0a", minHeight: 0 },
  messagesList: { display: "flex", flexDirection: "column", gap: "20px" },
  messageWrapper: { display: "flex", gap: "12px", alignItems: "flex-end" },
  messageAvatar: { width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 },
  messageBubble: { maxWidth: "60%", padding: "15px 20px", borderRadius: "20px", boxShadow: "0 2px 10px rgba(30, 58, 138, 0.3)" },
  ownMessage: { background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", color: "white", borderBottomRightRadius: "5px", border: "1px solid #60a5fa" },
  otherMessage: { background: "#1a1a1a", color: "#ffffff", borderBottomLeftRadius: "5px", border: "1px solid #1e40af" },
  senderName: { fontWeight: "600", fontSize: "14px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", color: "#93c5fd" },
  adminBadge: { background: "#3b82f6", color: "#ffffff", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" },
  messageText: { fontSize: "15px", lineHeight: "1.5", wordWrap: "break-word" },
  messageTime: { fontSize: "11px", marginTop: "8px", opacity: 0.7 },
  inputArea: { padding: "25px 30px", background: "#000000", borderTop: "2px solid #1e40af" },
  inputContainer: { display: "flex", gap: "15px", alignItems: "center" },
  input: { flex: 1, padding: "15px 20px", fontSize: "15px", border: "2px solid #1e40af", borderRadius: "50px", outline: "none", transition: "all 0.3s ease", background: "#0a0a0a", color: "#ffffff" },
  sendButton: { padding: "15px 30px", background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", color: "white", border: "none", borderRadius: "50px", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.3s ease", boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)" },
  sendIcon: { fontSize: "18px" },
  unreadBadge: { display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' },
  greenDot: { width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', animation: 'pulse 2s infinite' },
  unreadCount: { background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  contextMenu: { position: 'absolute', top: '100%', right: '0', background: '#1e293b', border: '2px solid #3b82f6', borderRadius: '8px', padding: '8px', marginTop: '5px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '5px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
  contextButton: { padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', transition: 'all 0.3s' },
  deletedMessage: { opacity: 0.6, fontStyle: 'italic' },
  editedLabel: { fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', marginLeft: '5px' },
  editHint: { position: 'absolute', top: '-25px', right: '0', background: '#1e293b', color: '#93c5fd', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', opacity: 0, transition: 'opacity 0.3s', pointerEvents: 'none', border: '1px solid #3b82f6' },
  emptyState: { textAlign: "center", padding: "60px 20px", color: "#93c5fd" },
  emptyIcon: { fontSize: "80px", marginBottom: "20px" },
  emptyTitle: { fontSize: "24px", color: "#ffffff", marginBottom: "10px" },
  emptyText: { fontSize: "16px", color: "#93c5fd" },
  loadingContainer: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1e3a8a 0%, #000000 100%)" },
  spinner: { width: "50px", height: "50px", border: "5px solid rgba(59, 130, 246, 0.3)", borderTop: "5px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" },
  loadingText: { color: "white", marginTop: "20px", fontSize: "20px" },
  errorContainer: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1e3a8a 0%, #000000 100%)", padding: "20px" },
  errorBox: { background: "#000000", padding: "50px", borderRadius: "20px", textAlign: "center", maxWidth: "500px", boxShadow: "0 20px 60px rgba(30, 58, 138, 0.5)", border: "2px solid #1e40af" },
  errorIcon: { fontSize: "60px", marginBottom: "20px" },
  errorTitle: { color: "#ffffff", marginBottom: "15px", fontSize: "24px" },
  errorMessage: { color: "#ef4444", fontSize: "16px", marginBottom: "15px", fontWeight: "600" },
  errorHint: { color: "#93c5fd", fontSize: "14px" },
  fileUploadButton: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fileUploadLabel: { padding: '12px 15px', background: '#1e40af', color: 'white', borderRadius: '50%', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', width: '45px', height: '45px', border: '2px solid #3b82f6' },
  selectedFilesPreview: { padding: '10px 15px', background: '#0a0a0a', borderBottom: '1px solid #1e40af', display: 'flex', flexWrap: 'wrap', gap: '10px' },
  filePreviewItem: { background: '#1e40af', color: 'white', padding: '8px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', border: '1px solid #3b82f6' },
  removeFileButton: { background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  fileAttachments: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' },
  fileAttachment: { background: 'rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: '8px', color: '#93c5fd', textDecoration: 'none', fontSize: '13px', display: 'inline-block', border: '1px solid rgba(147, 197, 253, 0.3)', transition: 'all 0.3s', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
};

export default ChatBox;
