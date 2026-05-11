import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const navigate = useNavigate();
  const { user, logout, getAuthHeader } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Chat state
  const [chatMode, setChatMode] = useState('direct'); // 'direct' or 'department'
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinned, setShowPinned] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, [chatMode]);

  const loadConversations = async () => {
    try {
      const headers = getAuthHeader();
      const endpoint = chatMode === 'direct' ? '/api/chat/users' : '/api/admin/departments';
      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedConversation, chatMode]);

  const loadMessages = async () => {
    try {
      const headers = getAuthHeader();
      let url = '/api/chat/messages';
      
      if (chatMode === 'direct') {
        url += `?userId=${selectedConversation._id}`;
      } else {
        url += `?departmentId=${selectedConversation._id}`;
      }
      
      const res = await fetch(url, { headers });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  // Fetch typing indicators
  useEffect(() => {
    if (!selectedConversation) return;
    
    const fetchTyping = async () => {
      try {
        const headers = getAuthHeader();
        const conversationId = chatMode === 'direct' 
          ? selectedConversation._id 
          : `department:${selectedConversation._id}`;
        
        const res = await fetch(`/api/chat/typing/${conversationId}`, { headers });
        if (res.ok) {
          const typing = await res.json();
          const names = typing
            .filter(t => t.userId !== user.id)
            .map(t => t.userName);
          setTypingUsers(names);
        }
      } catch (err) {}
    };
    
    fetchTyping();
    const interval = setInterval(fetchTyping, 1000);
    return () => clearInterval(interval);
  }, [selectedConversation, chatMode, user.id]);

  // Fetch pinned messages
  useEffect(() => {
    if (!selectedConversation) return;
    
    const fetchPinned = async () => {
      try {
        const headers = getAuthHeader();
        const conversationId = chatMode === 'direct' 
          ? selectedConversation._id 
          : `department:${selectedConversation._id}`;
        
        const res = await fetch(`/api/chat/pinned/${conversationId}`, { headers });
        if (res.ok) {
          setPinnedMessages(await res.json());
        }
      } catch (err) {}
    };
    
    fetchPinned();
  }, [selectedConversation, chatMode]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const notifyTyping = async (isTyping) => {
    try {
      const headers = getAuthHeader();
      const conversationId = chatMode === 'direct' 
        ? selectedConversation._id 
        : `department:${selectedConversation._id}`;
      
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers,
        body: JSON.stringify({ conversationId, isTyping })
      });
    } catch (err) {}
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setMessageText(val);
    
    // Handle @mentions
    const lastAtIndex = val.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const query = val.substring(lastAtIndex + 1);
      if (query.length >= 1) {
        searchMentions(query);
        setShowMentionSuggestions(true);
      }
    } else {
      setShowMentionSuggestions(false);
    }
    
    // Typing indicator
    notifyTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => notifyTyping(false), 3000);
  };

  const searchMentions = async (query) => {
    try {
      const headers = getAuthHeader();
      const res = await fetch(`/api/chat/search-users/${query}`, { headers });
      if (res.ok) {
        setMentionSuggestions(await res.json());
      }
    } catch (err) {}
  };

  const insertMention = (user) => {
    const lastAtIndex = messageText.lastIndexOf('@');
    const beforeAt = messageText.substring(0, lastAtIndex);
    const newText = `${beforeAt}@${user.name} `;
    setMessageText(newText);
    setShowMentionSuggestions(false);
    inputRef.current?.focus();
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    try {
      setLoading(true);
      const headers = getAuthHeader();
      
      const body = {
        text: messageText,
        ...(chatMode === 'direct' && { userId: selectedConversation._id }),
        ...(chatMode === 'department' && { departmentId: selectedConversation._id }),
        ...(replyingTo && { replyTo: replyingTo })
      };
      
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        setMessageText('');
        setReplyingTo(null);
        await loadMessages();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const pinMessage = async (messageId) => {
    try {
      const headers = getAuthHeader();
      const conversationId = chatMode === 'direct' 
        ? selectedConversation._id 
        : `department:${selectedConversation._id}`;
      
      const res = await fetch(`/api/chat/pin/${messageId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ conversationId })
      });
      
      if (res.ok) {
        await loadMessages();
      }
    } catch (err) {
      console.error('Error pinning message:', err);
    }
  };

  const unpinMessage = async (messageId) => {
    try {
      const headers = getAuthHeader();
      const conversationId = chatMode === 'direct' 
        ? selectedConversation._id 
        : `department:${selectedConversation._id}`;
      
      const res = await fetch(`/api/chat/unpin/${messageId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ conversationId })
      });
      
      if (res.ok) {
        await loadMessages();
      }
    } catch (err) {
      console.error('Error unpinning message:', err);
    }
  };

  const searchMessages = (query) => {
    if (!query.trim()) {
      setFilteredMessages([]);
      return;
    }
    
    const filtered = messages.filter(msg =>
      msg.text.toLowerCase().includes(query.toLowerCase()) ||
      msg.senderName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMessages(filtered);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/');
    }
  };

  const displayMessages = showSearch ? filteredMessages : messages;

  return (
    <div className="chat-page">
      {/* Sidebar */}
      <aside className={`chat-sidebar ${isMobile && selectedConversation ? 'hidden' : ''}`}>
        <div className="chat-sidebar-header">
          <h2>💬 Chat</h2>
          <button className="chat-logout-btn" onClick={handleLogout} title="Logout">🚪</button>
        </div>

        {/* Mode Tabs */}
        <div className="chat-mode-tabs">
          <button
            className={`chat-mode-tab ${chatMode === 'direct' ? 'active' : ''}`}
            onClick={() => setChatMode('direct')}
          >
            👤 Direct
          </button>
          <button
            className={`chat-mode-tab ${chatMode === 'department' ? 'active' : ''}`}
            onClick={() => setChatMode('department')}
          >
            🏢 Departments
          </button>
        </div>

        {/* Search */}
        <div className="chat-search-box">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="chat-search-input"
          />
        </div>

        {/* Conversations List */}
        <div className="chat-conversations">
          {conversations.map(conv => (
            <button
              key={conv._id}
              className={`chat-conversation-item ${selectedConversation?._id === conv._id ? 'active' : ''}`}
              onClick={() => setSelectedConversation(conv)}
            >
              <div className="chat-conv-avatar">
                {chatMode === 'direct' ? '👤' : '🏢'}
              </div>
              <div className="chat-conv-info">
                <div className="chat-conv-name">{conv.name || conv.email}</div>
                <div className="chat-conv-preview">Last message...</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`chat-main ${!selectedConversation && isMobile ? 'empty' : ''}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              {isMobile && (
                <button
                  className="chat-back-btn"
                  onClick={() => setSelectedConversation(null)}
                >
                  ← Back
                </button>
              )}
              <div className="chat-header-info">
                <h3>{selectedConversation.name || selectedConversation.email}</h3>
                <p className="chat-header-subtitle">
                  {chatMode === 'department' ? '🏢 Department' : '👤 Direct Message'}
                </p>
              </div>
              <div className="chat-header-actions">
                <button
                  className={`chat-action-btn ${showPinned ? 'active' : ''}`}
                  onClick={() => setShowPinned(!showPinned)}
                  title="Pinned messages"
                >
                  📌 {pinnedMessages.length}
                </button>
                <button
                  className={`chat-action-btn ${showSearch ? 'active' : ''}`}
                  onClick={() => setShowSearch(!showSearch)}
                  title="Search messages"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* Pinned Messages Panel */}
            {showPinned && pinnedMessages.length > 0 && (
              <div className="chat-pinned-panel">
                <h4>📌 Pinned Messages ({pinnedMessages.length})</h4>
                <div className="chat-pinned-list">
                  {pinnedMessages.map(pin => (
                    <div key={pin._id} className="chat-pinned-item">
                      <div className="chat-pinned-content">
                        <strong>{pin.messageId?.senderName}</strong>
                        <p>{pin.messageId?.text}</p>
                      </div>
                      <button
                        className="chat-unpin-btn"
                        onClick={() => unpinMessage(pin.messageId._id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Bar */}
            {showSearch && (
              <div className="chat-search-bar">
                <input
                  type="text"
                  placeholder="Search in this conversation..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchMessages(e.target.value);
                  }}
                  className="chat-search-input"
                  autoFocus
                />
              </div>
            )}

            {/* Messages Container */}
            <div className="chat-messages">
              {displayMessages.length === 0 ? (
                <div className="chat-empty">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                displayMessages.map(msg => (
                  <div
                    key={msg._id}
                    className={`chat-message ${msg.senderId === user.id ? 'own' : 'other'}`}
                  >
                    {msg.replyTo && (
                      <div className="chat-reply-to">
                        <small>↳ Replying to {msg.replyTo.senderName}</small>
                        <p>{msg.replyTo.text}</p>
                      </div>
                    )}
                    <div className="chat-message-content">
                      <strong>{msg.senderName}</strong>
                      <p>{msg.text}</p>
                      <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
                    </div>
                    {msg.senderId === user.id && (
                      <button
                        className="chat-pin-btn"
                        onClick={() => msg.isPinned ? unpinMessage(msg._id) : pinMessage(msg._id)}
                        title={msg.isPinned ? 'Unpin' : 'Pin'}
                      >
                        {msg.isPinned ? '📌' : '📍'}
                      </button>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="chat-typing">
                <p>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</p>
              </div>
            )}

            {/* Reply Preview */}
            {replyingTo && (
              <div className="chat-reply-preview">
                <div>
                  <small>Replying to {replyingTo.senderName}</small>
                  <p>{replyingTo.text}</p>
                </div>
                <button onClick={() => setReplyingTo(null)}>✕</button>
              </div>
            )}

            {/* Input Area */}
            <div className="chat-input-area">
              <div className="chat-input-wrapper">
                <textarea
                  ref={inputRef}
                  value={messageText}
                  onChange={handleTextChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message... (use @name to mention)"
                  className="chat-input"
                  rows="3"
                />
                
                {/* Mention Suggestions */}
                {showMentionSuggestions && mentionSuggestions.length > 0 && (
                  <div className="chat-mention-suggestions">
                    {mentionSuggestions.map(user => (
                      <button
                        key={user._id}
                        className="chat-mention-item"
                        onClick={() => insertMention(user)}
                      >
                        👤 {user.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="chat-send-btn"
                onClick={sendMessage}
                disabled={loading || !messageText.trim()}
              >
                {loading ? '⏳' : '➤'}
              </button>
            </div>
          </>
        ) : (
          <div className="chat-empty-state">
            <p>👋 Select a conversation to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
