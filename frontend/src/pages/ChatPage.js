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
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  
  // Phase 2 state
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [mediaMessages, setMediaMessages] = useState([]);
  const [starredMessages, setStarredMessages] = useState([]);
  const [showStarred, setShowStarred] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [departmentMembers, setDepartmentMembers] = useState([]);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  
  // Phase 3 state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mutedConversations, setMutedConversations] = useState(() => {
    const saved = localStorage.getItem('mutedConversations');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callRoomName, setCallRoomName] = useState('');
  const [callState, setCallState] = useState('idle'); // 'idle', 'calling', 'ringing', 'connected', 'ended'
  const [callType, setCallType] = useState('audio'); // 'audio' or 'video'
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimerRef = useRef(null);
  
  // Debug lightbox state
  useEffect(() => {
    console.log('Lightbox state changed:', lightboxImage);
  }, [lightboxImage]);

  // Prevent image navigation globally
  useEffect(() => {
    const handleImageClick = (e) => {
      const target = e.target;
      if (target.tagName === 'IMG' && target.classList.contains('chat-file-image')) {
        e.preventDefault();
        e.stopPropagation();
        const imageUrl = target.src;
        console.log('Global image click intercepted:', imageUrl);
        setLightboxImage(imageUrl);
        return false;
      }
    };
    
    document.addEventListener('click', handleImageClick, true);
    return () => document.removeEventListener('click', handleImageClick, true);
  }, []);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const notificationSoundRef = useRef(null);

  // Helper function to get full file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    // If already a full URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    // In development, use localhost:5000
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return `http://localhost:5000/${cleanPath}`;
    }
    // In production, use relative path
    return `/${cleanPath}`;
  };

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
      let endpoint = '';
      
      if (chatMode === 'direct') {
        endpoint = '/api/chat/users';
      } else {
        // For departments: admin sees all, staff sees only their own
        if (user.role === 'admin') {
          endpoint = '/api/admin/departments';
        } else {
          // Staff should see only their department
          endpoint = '/api/staff/my-department';
        }
      }
      
      console.log('Loading conversations from:', endpoint);
      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        let data = await res.json();
        console.log('Conversations loaded:', data);
        if (data.length > 0) {
          console.log('First item details:', JSON.stringify(data[0], null, 2));
        }
        // If staff gets their single department, wrap it in an array
        if (!Array.isArray(data)) {
          data = [data];
        }
        setConversations(data);
      } else {
        console.error('Failed to load conversations:', res.status);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    loadMessages();
    
    // Load department members if in department mode
    if (chatMode === 'department') {
      loadDepartmentMembers();
    }
    
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedConversation, chatMode]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Show a friendly prompt
      setTimeout(() => {
        if (window.confirm('Enable desktop notifications for new messages?')) {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              // Show test notification
              new Notification('Notifications Enabled! 🎉', {
                body: 'You will now receive notifications for new messages',
                icon: '/logo192.png'
              });
            }
          });
        }
      }, 2000); // Wait 2 seconds after page load
    }
  }, []);

  // Check for new messages and show notifications
  useEffect(() => {
    if (messages.length > lastMessageCount && lastMessageCount > 0) {
      const newMessages = messages.slice(lastMessageCount);
      newMessages.forEach(msg => {
        if (msg.senderId !== user.id) {
          showNotification(msg);
        }
      });
    }
    setLastMessageCount(messages.length);
  }, [messages]);

  const showNotification = (message) => {
    const conversationId = chatMode === 'direct' 
      ? selectedConversation._id 
      : `department:${selectedConversation._id}`;
    
    // Check if conversation is muted
    if (mutedConversations.includes(conversationId)) {
      return;
    }

    // Play notification sound
    playNotificationSound();

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(message.senderName, {
        body: message.text || '📎 Sent an attachment',
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: conversationId,
        requireInteraction: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    }
  };

  const playNotificationSound = () => {
    // Create a simple notification beep
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const toggleMuteConversation = () => {
    const conversationId = chatMode === 'direct' 
      ? selectedConversation._id 
      : `department:${selectedConversation._id}`;
    
    const newMuted = mutedConversations.includes(conversationId)
      ? mutedConversations.filter(id => id !== conversationId)
      : [...mutedConversations, conversationId];
    
    setMutedConversations(newMuted);
    localStorage.setItem('mutedConversations', JSON.stringify(newMuted));
  };

  const isConversationMuted = () => {
    if (!selectedConversation) return false;
    const conversationId = chatMode === 'direct' 
      ? selectedConversation._id 
      : `department:${selectedConversation._id}`;
    return mutedConversations.includes(conversationId);
  };

  const loadDepartmentMembers = async () => {
    try {
      const headers = getAuthHeader();
      // Get all staff and filter by department
      const res = await fetch('/api/admin/all-staff', { headers });
      if (res.ok) {
        const allStaff = await res.json();
        const members = allStaff.filter(staff => 
          staff.department?._id === selectedConversation._id || 
          staff.department === selectedConversation._id
        );
        setDepartmentMembers(members);
      }
    } catch (err) {
      console.error('Error loading department members:', err);
    }
  };

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

  // Don't auto-scroll - let user scroll manually
  // This prevents the page from jumping when opening a chat

  // Handle typing indicator
  const notifyTyping = async (isTyping) => {
    try {
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };
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
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };
      
      let receiverId = '';
      if (chatMode === 'direct') {
        receiverId = selectedConversation._id;
      } else if (chatMode === 'department') {
        receiverId = `department:${selectedConversation._id}`;
      }
      
      const body = {
        text: messageText,
        receiverId: receiverId,
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
      } else {
        const error = await res.json();
        console.error('Error sending message:', error);
        alert('Error: ' + (error.message || 'Failed to send message'));
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Error sending message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const pinMessage = async (messageId) => {
    try {
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };
      const conversationId = chatMode === 'direct' 
        ? selectedConversation._id 
        : `department:${selectedConversation._id}`;
      
      const res = await fetch(`/api/chat/pin/${messageId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ conversationId })
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Pin success:', data);
        await loadMessages();
        // Reload pinned messages
        const pinnedRes = await fetch(`/api/chat/pinned/${conversationId}`, { headers: getAuthHeader() });
        if (pinnedRes.ok) {
          setPinnedMessages(await pinnedRes.json());
        }
      } else {
        const error = await res.json();
        console.error('Pin error:', error);
        alert('Error pinning message: ' + error.message);
      }
    } catch (err) {
      console.error('Error pinning message:', err);
      alert('Error: ' + err.message);
    }
  };

  const unpinMessage = async (messageId) => {
    try {
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };
      const conversationId = chatMode === 'direct' 
        ? selectedConversation._id 
        : `department:${selectedConversation._id}`;
      
      const res = await fetch(`/api/chat/unpin/${messageId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ conversationId })
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Unpin success:', data);
        await loadMessages();
        // Reload pinned messages
        const pinnedRes = await fetch(`/api/chat/pinned/${conversationId}`, { headers: getAuthHeader() });
        if (pinnedRes.ok) {
          setPinnedMessages(await pinnedRes.json());
        }
      } else {
        const error = await res.json();
        console.error('Unpin error:', error);
        alert('Error unpinning message: ' + error.message);
      }
    } catch (err) {
      console.error('Error unpinning message:', err);
      alert('Error: ' + err.message);
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

  // ── PHASE 2 FUNCTIONS ──
  
  // React to message
  const reactToMessage = async (messageId, emoji) => {
    try {
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };
      
      const res = await fetch(`/api/chat/messages/${messageId}/react`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ emoji })
      });
      
      if (res.ok) {
        await loadMessages();
      }
    } catch (err) {
      console.error('Error reacting to message:', err);
    }
  };

  // Star/unstar message
  const toggleStarMessage = async (messageId) => {
    try {
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };
      
      const res = await fetch(`/api/chat/messages/${messageId}/star`, {
        method: 'POST',
        headers
      });
      
      if (res.ok) {
        const data = await res.json();
        setStarredMessages(data.starredMessages || []);
        await loadMessages();
      }
    } catch (err) {
      console.error('Error starring message:', err);
    }
  };

  // Load starred messages
  useEffect(() => {
    const loadStarred = async () => {
      try {
        const headers = getAuthHeader();
        const res = await fetch('/api/chat/starred', { headers });
        if (res.ok) {
          setStarredMessages(await res.json());
        }
      } catch (err) {}
    };
    loadStarred();
  }, []);

  // Load media gallery
  const loadMediaGallery = async () => {
    try {
      const headers = getAuthHeader();
      let url = '/api/chat/media';
      
      if (chatMode === 'direct') {
        url += `?userId=${selectedConversation._id}`;
      } else {
        url += `?departmentId=${selectedConversation._id}`;
      }
      
      const res = await fetch(url, { headers });
      if (res.ok) {
        setMediaMessages(await res.json());
      }
    } catch (err) {
      console.error('Error loading media:', err);
    }
  };

  // Get read receipts
  const getReadReceipts = async (messageId) => {
    try {
      const headers = getAuthHeader();
      const res = await fetch(`/api/chat/messages/${messageId}/read-by`, { headers });
      if (res.ok) {
        const data = await res.json();
        alert(`Read by: ${data.names.join(', ') || 'No one yet'}`);
      }
    } catch (err) {
      console.error('Error fetching read receipts:', err);
    }
  };

  // Forward message
  const forwardMessage = async (messageId, targetConversationId) => {
    try {
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };
      
      const message = messages.find(m => m._id === messageId);
      if (!message) return;
      
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: message.text,
          receiverId: targetConversationId,
          forwardedFrom: message.senderName
        })
      });
      
      if (res.ok) {
        alert('Message forwarded successfully!');
        setShowForwardModal(false);
        setMessageToForward(null);
      } else {
        const error = await res.json();
        alert('Error forwarding: ' + error.message);
      }
    } catch (err) {
      console.error('Error forwarding message:', err);
      alert('Error forwarding message');
    }
  };

  const openForwardModal = (message) => {
    setMessageToForward(message);
    setShowForwardModal(true);
  };

  // Edit message
  const editMessage = async (messageId, newText) => {
    try {
      const headers = {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };
      
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ text: newText })
      });
      
      if (res.ok) {
        await loadMessages();
      } else {
        const error = await res.json();
        alert('Error: ' + error.message);
      }
    } catch (err) {
      console.error('Error editing message:', err);
      alert('Error editing message');
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      const headers = getAuthHeader();
      
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers
      });
      
      if (res.ok) {
        await loadMessages();
      } else {
        const error = await res.json();
        alert('Error: ' + error.message);
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Error deleting message');
    }
  };

  // Voice/Video Call - WhatsApp Style
  const startCall = async (type) => {
    if (chatMode !== 'direct') {
      alert('Calls are only available for direct messages');
      return;
    }

    try {
      setCallType(type);
      setCallState('calling');
      setShowCallModal(true);
      setCallDuration(0);
      
      // Get user media (camera/microphone)
      const constraints = {
        audio: true,
        video: type === 'video'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Simulate call ringing (in real app, this would use WebRTC signaling)
      setTimeout(() => {
        setCallState('ringing');
      }, 1000);
      
      // Don't auto-answer - wait for user to manually answer or the other person to pick up
      
    } catch (err) {
      console.error('Error accessing media devices:', err);
      alert('Could not access camera/microphone. Please check permissions.');
      endCall();
    }
  };

  // Manually answer call (for testing)
  const answerCall = () => {
    setCallState('connected');
    startCallTimer();
  };

  // Manually decline call
  const declineCall = () => {
    endCall();
  };

  const endCall = () => {
    // Stop all media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    
    // Clear timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    
    // Reset state
    setCallState('idle');
    setShowCallModal(false);
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsCallMinimized(false);
    setIsSpeakerOn(false);
  };

  const minimizeCall = () => {
    setIsCallMinimized(true);
  };

  const maximizeCall = () => {
    setIsCallMinimized(false);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // In a real implementation, this would change audio output device
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ── PHASE 3 FUNCTIONS ──
  
  // Online status polling
  useEffect(() => {
    if (!selectedConversation || chatMode !== 'direct') return;
    
    const checkOnlineStatus = async () => {
      try {
        const headers = getAuthHeader();
        const res = await fetch(`/api/chat/online-status?ids=${selectedConversation._id}`, { headers });
        if (res.ok) {
          const status = await res.json();
          setOnlineUsers(status);
        }
      } catch (err) {}
    };
    
    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [selectedConversation, chatMode]);

  // Send heartbeat to mark self as online
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const headers = {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        };
        await fetch('/api/chat/heartbeat', { method: 'POST', headers });
      } catch (err) {}
    };
    
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 20000); // Every 20s
    return () => clearInterval(interval);
  }, []);

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        sendVoiceMessage(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
      setRecordingTime(0);
      recorder.start();
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordingTime(0);
      clearInterval(recordingIntervalRef.current);
      setAudioChunks([]);
    }
  };

  const sendVoiceMessage = async (audioBlob) => {
    try {
      // Don't use getAuthHeader() - we need to exclude Content-Type for FormData
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - browser will set it with boundary
      };
      
      const formData = new FormData();
      formData.append('files', audioBlob, 'voice-message.webm');
      
      let receiverId = '';
      if (chatMode === 'direct') {
        receiverId = selectedConversation._id;
      } else if (chatMode === 'department') {
        receiverId = `department:${selectedConversation._id}`;
      }
      formData.append('receiverId', receiverId);
      formData.append('text', '🎤 Voice message');
      
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers,
        body: formData
      });
      
      if (res.ok) {
        await loadMessages();
      } else {
        const error = await res.json();
        console.error('Voice upload error:', error);
        alert('Error sending voice message: ' + error.message);
      }
    } catch (err) {
      console.error('Error sending voice message:', err);
      alert('Error sending voice message: ' + err.message);
    }
  };

  // File upload
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isImageFile = (file) => {
    return file && file.type && file.type.startsWith('image/');
  };

  const isVideoFile = (file) => {
    return file && file.type && file.type.startsWith('video/');
  };

  const getFilePreviewUrl = (file) => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return getFileUrl(file.path);
  };

  const sendFilesWithMessage = async () => {
    if (selectedFiles.length === 0 && !messageText.trim()) return;
    
    try {
      setLoading(true);
      // Don't use getAuthHeader() directly - we need to exclude Content-Type for FormData
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - browser will set it with boundary for multipart/form-data
      };
      
      const formData = new FormData();
      
      let receiverId = '';
      if (chatMode === 'direct') {
        receiverId = selectedConversation._id;
      } else if (chatMode === 'department') {
        receiverId = `department:${selectedConversation._id}`;
      }
      
      formData.append('receiverId', receiverId);
      if (messageText.trim()) {
        formData.append('text', messageText);
      }
      
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      if (replyingTo) {
        formData.append('replyToId', replyingTo._id);
      }
      
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers,
        body: formData
      });
      
      if (res.ok) {
        setMessageText('');
        setSelectedFiles([]);
        setReplyingTo(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadMessages();
      } else {
        const error = await res.json();
        console.error('Upload error:', error);
        alert('Error uploading file: ' + error.message);
      }
    } catch (err) {
      console.error('Error sending files:', err);
      alert('Error uploading file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Context menu handler
  const handleContextMenu = (e, message) => {
    e.preventDefault();
    
    // Calculate position to keep menu within viewport
    const menuWidth = 180;
    const menuHeight = 300; // approximate
    const x = e.clientX + menuWidth > window.innerWidth 
      ? window.innerWidth - menuWidth - 10 
      : e.clientX;
    const y = e.clientY + menuHeight > window.innerHeight 
      ? window.innerHeight - menuHeight - 10 
      : e.clientY;
    
    setContextMenu({ x, y, message });
    setSelectedMessage(message);
  };

  // Close context menu
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/');
    }
  };

  const displayMessages = showSearch && messageSearchQuery ? filteredMessages : messages;

  return (
    <div className="chat-page">
      {/* Sidebar */}
      <aside className={`chat-sidebar ${isMobile && selectedConversation ? 'hidden' : ''}`}>
        <div className="chat-sidebar-header">
          <h2>💬 Chat</h2>
          <button 
            className="chat-logout-btn" 
            onClick={() => navigate(user.role === 'admin' ? '/home' : '/staff-dashboard')} 
            title="Back to Dashboard"
          >
            ← Back
          </button>
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
          {conversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
              {chatMode === 'direct' ? 'No users found' : 'No departments found'}
            </div>
          ) : (
            conversations.map(conv => (
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
                  <div className="chat-conv-preview">
                    {chatMode === 'department' && (conv.memberCount !== undefined || conv.members)
                      ? `${conv.memberCount || conv.members?.length || 0} members` 
                      : 'Click to chat...'}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`chat-main ${!selectedConversation ? 'empty' : ''}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <button
                className="chat-back-btn"
                onClick={() => setSelectedConversation(null)}
                style={{ display: 'block' }}
              >
                ← 
              </button>
              <div className="chat-header-info">
                <h3 style={{ color: '#000000' }}>{selectedConversation.name || selectedConversation.email}</h3>
                <p className="chat-header-subtitle" style={{ color: '#000000' }}>
                  {chatMode === 'department' ? (
                    '🏢 Department'
                  ) : (
                    onlineUsers[selectedConversation._id]?.online ? (
                      <span className="chat-online-status">🟢 Online</span>
                    ) : onlineUsers[selectedConversation._id]?.lastSeen ? (
                      <span className="chat-offline-status">
                        Last seen {new Date(onlineUsers[selectedConversation._id].lastSeen).toLocaleTimeString()}
                      </span>
                    ) : (
                      '👤 Direct Message'
                    )
                  )}
                </p>
              </div>
              <div className="chat-header-actions">
                {selectedConversation && (
                  <>
                    <button
                      className={`chat-action-btn ${isConversationMuted() ? 'active' : ''}`}
                      onClick={toggleMuteConversation}
                      title={isConversationMuted() ? 'Unmute notifications' : 'Mute notifications'}
                    >
                      {isConversationMuted() ? '🔕' : '🔔'}
                    </button>
                    {Notification.permission !== 'granted' && (
                      <button
                        className="chat-action-btn chat-notification-prompt"
                        onClick={() => {
                          Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                              new Notification('Notifications Enabled! 🎉', {
                                body: 'You will now receive notifications for new messages',
                                icon: '/logo192.png'
                              });
                            }
                          });
                        }}
                        title="Enable notifications"
                      >
                        🔔❗
                      </button>
                    )}
                  </>
                )}
                {chatMode === 'direct' && selectedConversation && (
                  <>
                    <button
                      className="chat-action-btn"
                      onClick={() => startCall('audio')}
                      title="Voice call"
                    >
                      📞
                    </button>
                    <button
                      className="chat-action-btn"
                      onClick={() => startCall('video')}
                      title="Video call"
                    >
                      📹
                    </button>
                  </>
                )}
                {chatMode === 'department' && (
                  <button
                    className={`chat-action-btn ${showMembers ? 'active' : ''}`}
                    onClick={() => setShowMembers(!showMembers)}
                    title="Department members"
                  >
                    👥 {departmentMembers.length}
                  </button>
                )}
                <button
                  className={`chat-action-btn ${showStarred ? 'active' : ''}`}
                  onClick={() => setShowStarred(!showStarred)}
                  title="Starred messages"
                >
                  ⭐ {starredMessages.length}
                </button>
                <button
                  className={`chat-action-btn ${showPinned ? 'active' : ''}`}
                  onClick={() => setShowPinned(!showPinned)}
                  title="Pinned messages"
                >
                  📌 {pinnedMessages.length}
                </button>
                <button
                  className={`chat-action-btn ${showMediaGallery ? 'active' : ''}`}
                  onClick={() => {
                    setShowMediaGallery(!showMediaGallery);
                    if (!showMediaGallery) loadMediaGallery();
                  }}
                  title="Media gallery"
                >
                  🖼️
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

            {/* Starred Messages Panel */}
            {showStarred && starredMessages.length > 0 && (
              <div className="chat-pinned-panel">
                <h4>⭐ Starred Messages ({starredMessages.length})</h4>
                <div className="chat-pinned-list">
                  {starredMessages.map(star => (
                    <div key={star.messageId} className="chat-pinned-item">
                      <div className="chat-pinned-content">
                        <strong>{star.senderName}</strong>
                        <p>{star.text}</p>
                        <small>{new Date(star.createdAt).toLocaleString()}</small>
                      </div>
                      <button
                        className="chat-unpin-btn"
                        onClick={() => toggleStarMessage(star.messageId)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Gallery Panel */}
            {showMediaGallery && (
              <div className="chat-pinned-panel">
                <h4>🖼️ Media Gallery ({mediaMessages.length})</h4>
                <div className="chat-media-gallery-grid">
                  {mediaMessages.length === 0 ? (
                    <p>No media shared yet</p>
                  ) : (
                    mediaMessages.map(msg => (
                      msg.files.map((file, idx) => {
                        const fileUrl = getFileUrl(file.path);
                        return (
                          <div key={`${msg._id}-${idx}`} className="chat-gallery-item">
                            {file.path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setLightboxImage(fileUrl);
                                }}
                                className="chat-gallery-image-btn"
                              >
                                <img 
                                  src={fileUrl} 
                                  alt={file.originalName}
                                  className="chat-gallery-thumbnail"
                                />
                              </button>
                            ) : file.path.match(/\.(mp4|webm)$/i) ? (
                              <div className="chat-gallery-video">
                                <video 
                                  src={fileUrl} 
                                  className="chat-gallery-thumbnail"
                                />
                                <div className="chat-video-play-overlay">▶️</div>
                              </div>
                            ) : (
                              <div className="chat-gallery-file">
                                <div className="chat-gallery-file-icon">📄</div>
                                <span className="chat-gallery-file-name">{file.originalName}</span>
                              </div>
                            )}
                            <div className="chat-gallery-info">
                              <small>{msg.senderName}</small>
                              <small>{new Date(msg.createdAt).toLocaleDateString()}</small>
                            </div>
                          </div>
                        );
                      })
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Department Members Panel */}
            {showMembers && chatMode === 'department' && (
              <div className="chat-pinned-panel">
                <h4>👥 Department Members ({departmentMembers.length})</h4>
                <div className="chat-members-list">
                  {departmentMembers.length === 0 ? (
                    <p>No members in this department</p>
                  ) : (
                    departmentMembers.map(member => (
                      <div key={member._id} className="chat-member-item">
                        <div className="chat-member-avatar">👤</div>
                        <div className="chat-member-info">
                          <strong>{member.name}</strong>
                          <small>{member.email}</small>
                        </div>
                        <button
                          className="chat-mention-btn"
                          onClick={() => {
                            setMessageText(prev => prev + `@${member.name} `);
                            inputRef.current?.focus();
                          }}
                          title="Mention this person"
                        >
                          @
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Search Bar */}
            {showSearch && (
              <div className="chat-search-bar">
                <input
                  type="text"
                  placeholder="Search in this conversation..."
                  value={messageSearchQuery}
                  onChange={(e) => {
                    setMessageSearchQuery(e.target.value);
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
                    onContextMenu={(e) => handleContextMenu(e, msg)}
                  >
                    <div className="chat-message-wrapper">
                      {msg.forwardedFrom && (
                        <div className="chat-forwarded">
                          <small>↪️ Forwarded from {msg.forwardedFrom}</small>
                        </div>
                      )}
                      {msg.replyTo && (
                        <div className="chat-reply-to">
                          <small>↳ Replying to {msg.replyTo.senderName}</small>
                          <p>{msg.replyTo.text}</p>
                        </div>
                      )}
                      <div className="chat-message-content">
                        <strong>{msg.senderName}</strong>
                        <p>{msg.text}</p>
                        
                        {/* File attachments */}
                        {msg.files && msg.files.length > 0 && (
                          <div className="chat-message-files">
                            {msg.files.map((file, idx) => {
                              const canDownload = user.role === 'admin' || 
                                (chatMode === 'department' && selectedConversation.groupAdmins?.includes(user.id));
                              
                              // Get full file URL
                              const fileUrl = getFileUrl(file.path);
                              
                              return (
                                <div key={idx} className="chat-file-attachment">
                                  {file.path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Image clicked, opening lightbox:', fileUrl);
                                        setLightboxImage(fileUrl);
                                        return false;
                                      }}
                                      style={{ 
                                        cursor: 'pointer', 
                                        border: 'none', 
                                        background: 'none', 
                                        padding: 0,
                                        display: 'block'
                                      }}
                                    >
                                      <img 
                                        src={fileUrl} 
                                        alt={file.originalName} 
                                        className="chat-file-image"
                                        style={{ pointerEvents: 'none', display: 'block' }}
                                        draggable="false"
                                      />
                                    </button>
                                  ) : file.path.match(/\.(mp4|webm)$/i) ? (
                                    <video src={fileUrl} controls className="chat-file-video" />
                                  ) : file.path.match(/\.(mp3|webm|ogg|wav)$/i) ? (
                                    <audio src={fileUrl} controls className="chat-file-audio" />
                                  ) : canDownload ? (
                                    <a href={fileUrl} download={file.originalName} className="chat-file-link">
                                      📎 {file.originalName}
                                    </a>
                                  ) : (
                                    <div className="chat-file-link chat-file-locked" title="Only admins can download files">
                                      🔒 {file.originalName}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="chat-reactions">
                            {msg.reactions.map((reaction, idx) => (
                              <span key={idx} className="chat-reaction" title={reaction.userName}>
                                {reaction.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="chat-message-footer">
                          <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
                          {msg.isEdited && <small className="chat-edited"> (edited)</small>}
                          {msg.senderId === user.id && (
                            <span className="chat-message-status" title="Delivered">✓✓</span>
                          )}
                          {chatMode === 'department' && (
                            <button
                              className="chat-read-btn"
                              onClick={() => getReadReceipts(msg._id)}
                              title="See who read this"
                            >
                              👁️
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Message Actions - Floating on Hover */}
                      <div className="chat-message-actions">
                        <button
                          className="chat-action-icon"
                          onClick={() => reactToMessage(msg._id, '👍')}
                          title="Like"
                        >
                          👍
                        </button>
                        <button
                          className="chat-action-icon"
                          onClick={() => reactToMessage(msg._id, '❤️')}
                          title="Love"
                        >
                          ❤️
                        </button>
                        <button
                          className="chat-action-icon"
                          onClick={() => reactToMessage(msg._id, '😂')}
                          title="Laugh"
                        >
                          😂
                        </button>
                        <button
                          className="chat-action-icon"
                          onClick={() => toggleStarMessage(msg._id)}
                          title={starredMessages.some(s => s.messageId === msg._id) ? 'Unstar' : 'Star'}
                        >
                          {starredMessages.some(s => s.messageId === msg._id) ? '⭐' : '☆'}
                        </button>
                        <button
                          className="chat-action-icon"
                          onClick={() => setReplyingTo(msg)}
                          title="Reply"
                        >
                          ↩️
                        </button>
                        {(msg.senderId === user.id || user.role === 'admin') && (
                          <button
                            className="chat-action-icon"
                            onClick={() => msg.isPinned ? unpinMessage(msg._id) : pinMessage(msg._id)}
                            title={msg.isPinned ? 'Unpin' : 'Pin'}
                          >
                            {msg.isPinned ? '📌' : '📍'}
                          </button>
                        )}
                      </div>
                    </div>
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
              {!isRecording ? (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    style={{ display: 'none' }}
                  />
                  <button
                    className="chat-attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach files"
                  >
                    📎
                  </button>
                  
                  <div className="chat-input-wrapper">
                    {selectedFiles.length > 0 && (
                      <div className="chat-selected-files-preview">
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="chat-file-preview-item">
                            {isImageFile(file) ? (
                              <div className="chat-image-preview">
                                <img 
                                  src={getFilePreviewUrl(file)} 
                                  alt={file.name}
                                  className="chat-preview-thumbnail"
                                />
                                <button 
                                  className="chat-remove-file"
                                  onClick={() => removeSelectedFile(idx)}
                                  title="Remove"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : isVideoFile(file) ? (
                              <div className="chat-video-preview">
                                <video 
                                  src={getFilePreviewUrl(file)} 
                                  className="chat-preview-thumbnail"
                                />
                                <div className="chat-video-overlay">📹</div>
                                <button 
                                  className="chat-remove-file"
                                  onClick={() => removeSelectedFile(idx)}
                                  title="Remove"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="chat-file-preview">
                                <div className="chat-file-icon-preview">📄</div>
                                <span className="chat-file-name-preview">{file.name}</span>
                                <button 
                                  className="chat-remove-file"
                                  onClick={() => removeSelectedFile(idx)}
                                  title="Remove"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <textarea
                      ref={inputRef}
                      value={messageText}
                      onChange={handleTextChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (selectedFiles.length > 0) {
                            sendFilesWithMessage();
                          } else {
                            sendMessage();
                          }
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
                  
                  {messageText.trim() || selectedFiles.length > 0 ? (
                    <button
                      className="chat-send-btn"
                      onClick={selectedFiles.length > 0 ? sendFilesWithMessage : sendMessage}
                      disabled={loading}
                    >
                      {loading ? '⏳' : '➤'}
                    </button>
                  ) : (
                    <button
                      className="chat-voice-btn"
                      onClick={startRecording}
                      title="Record voice message"
                    >
                      🎤
                    </button>
                  )}
                </>
              ) : (
                <div className="chat-recording-ui">
                  <button className="chat-cancel-recording" onClick={cancelRecording}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                    </svg>
                  </button>
                  <div className="chat-recording-waveform">
                    <span className="chat-recording-dot"></span>
                    <span className="chat-recording-time">{formatTime(recordingTime)}</span>
                  </div>
                  <button className="chat-send-recording" onClick={stopRecording}>
                    ➤
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="chat-empty-state">
            <p>👋 Select a conversation to start chatting</p>
          </div>
        )}
      </main>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="chat-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => {
            setReplyingTo(contextMenu.message);
            setContextMenu(null);
          }}>
            ↩️ Reply
          </button>
          <button onClick={() => {
            toggleStarMessage(contextMenu.message._id);
            setContextMenu(null);
          }}>
            ⭐ {starredMessages.some(s => s.messageId === contextMenu.message._id) ? 'Unstar' : 'Star'}
          </button>
          <button onClick={() => {
            openForwardModal(contextMenu.message);
            setContextMenu(null);
          }}>
            ↪️ Forward
          </button>
          {contextMenu.message.senderId === user.id && (
            <>
              <button onClick={() => {
                const newText = prompt('Edit message:', contextMenu.message.text);
                if (newText && newText.trim()) {
                  editMessage(contextMenu.message._id, newText);
                }
                setContextMenu(null);
              }}>
                ✏️ Edit
              </button>
              <button onClick={() => {
                if (window.confirm('Delete this message?')) {
                  deleteMessage(contextMenu.message._id);
                }
                setContextMenu(null);
              }}>
                🗑️ Delete
              </button>
            </>
          )}
          {chatMode === 'department' && (
            <button onClick={() => {
              getReadReceipts(contextMenu.message._id);
              setContextMenu(null);
            }}>
              👁️ Read by
            </button>
          )}
        </div>
      )}

      {/* Forward Modal */}
      {showForwardModal && messageToForward && (
        <div className="chat-modal-overlay" onClick={() => setShowForwardModal(false)}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <h3>Forward Message</h3>
              <button className="chat-modal-close" onClick={() => setShowForwardModal(false)}>✕</button>
            </div>
            
            <div className="chat-modal-content">
              <div className="chat-forward-preview">
                <strong>{messageToForward.senderName}</strong>
                <p>{messageToForward.text}</p>
              </div>
              
              <h4>Forward to:</h4>
              
              {/* Direct Messages */}
              <div className="chat-forward-section">
                <h5>👤 Direct Messages</h5>
                <div className="chat-forward-list">
                  {conversations
                    .filter(c => !c.members && !c.memberCount) // Filter for users only
                    .map(conv => (
                      <button
                        key={conv._id}
                        className="chat-forward-item"
                        onClick={() => forwardMessage(messageToForward._id, conv._id)}
                      >
                        <div className="chat-conv-avatar">👤</div>
                        <div className="chat-conv-info">
                          <div className="chat-conv-name">{conv.name || conv.email}</div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
              
              {/* Departments */}
              {user.role === 'admin' && (
                <div className="chat-forward-section">
                  <h5>🏢 Departments</h5>
                  <div className="chat-forward-list">
                    {conversations
                      .filter(c => c.members || c.memberCount !== undefined) // Filter for departments
                      .map(conv => (
                        <button
                          key={conv._id}
                          className="chat-forward-item"
                          onClick={() => forwardMessage(messageToForward._id, `department:${conv._id}`)}
                        >
                          <div className="chat-conv-avatar">🏢</div>
                          <div className="chat-conv-info">
                            <div className="chat-conv-name">{conv.name}</div>
                            <small>{conv.memberCount || conv.members?.length || 0} members</small>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Call Modal - WhatsApp Style */}
      {showCallModal && (
        <div className={`whatsapp-call-overlay ${isCallMinimized ? 'minimized' : ''}`}>
          <div className={`whatsapp-call-container ${isCallMinimized ? 'minimized' : ''}`}>
            
            {!isCallMinimized ? (
              <>
                {/* Call Header */}
                <div className="whatsapp-call-header">
                  <div className="whatsapp-call-top-controls">
                    <button 
                      className="whatsapp-minimize-btn"
                      onClick={minimizeCall}
                      title="Minimize"
                    >
                      ─
                    </button>
                  </div>
                  <div className="whatsapp-call-info">
                    <div className="whatsapp-caller-avatar">
                      {selectedConversation?.name?.charAt(0) || '👤'}
                    </div>
                    <div className="whatsapp-caller-details">
                      <h3>{selectedConversation?.name || 'Unknown'}</h3>
                      <p className="whatsapp-call-status">
                        {callState === 'calling' && 'Calling...'}
                        {callState === 'ringing' && 'Ringing...'}
                        {callState === 'connected' && formatCallDuration(callDuration)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Video Area */}
                <div className="whatsapp-video-area">
                  {callType === 'video' && (
                    <>
                      {/* Remote Video (main) */}
                      <video
                        ref={remoteVideoRef}
                        className="whatsapp-remote-video"
                        autoPlay
                        playsInline
                      />
                      
                      {/* Local Video (small overlay) */}
                      <video
                        ref={localVideoRef}
                        className="whatsapp-local-video"
                        autoPlay
                        playsInline
                        muted
                      />
                    </>
                  )}
                  
                  {callType === 'audio' && (
                    <div className="whatsapp-audio-call">
                      <div className="whatsapp-audio-avatar">
                        {selectedConversation?.name?.charAt(0) || '👤'}
                      </div>
                      <div className="whatsapp-audio-waves">
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Call Controls */}
                <div className="whatsapp-call-controls">
                  {callState === 'ringing' && (
                    <>
                      <button
                        className="whatsapp-answer-btn"
                        onClick={answerCall}
                        title="Answer call"
                      >
                        📞
                      </button>
                      <button
                        className="whatsapp-decline-btn"
                        onClick={declineCall}
                        title="Decline call"
                      >
                        📞
                      </button>
                    </>
                  )}
                  
                  {callState === 'connected' && (
                    <>
                      {callType === 'audio' && (
                        <button
                          className={`whatsapp-control-btn ${isSpeakerOn ? 'active' : ''}`}
                          onClick={toggleSpeaker}
                          title={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
                        >
                          {isSpeakerOn ? '🔊' : '🔈'}
                        </button>
                      )}
                      
                      <button
                        className={`whatsapp-control-btn ${isMuted ? 'muted' : ''}`}
                        onClick={toggleMute}
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? '🔇' : '🎤'}
                      </button>
                      
                      {callType === 'video' && (
                        <button
                          className={`whatsapp-control-btn ${isVideoOff ? 'video-off' : ''}`}
                          onClick={toggleVideo}
                          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                        >
                          {isVideoOff ? '📹' : '📷'}
                        </button>
                      )}
                    </>
                  )}
                  
                  {(callState === 'calling' || callState === 'connected') && (
                    <button
                      className="whatsapp-end-call-btn"
                      onClick={endCall}
                      title="End call"
                    >
                      📞
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Minimized Call Window */
              <div className="whatsapp-minimized-call" onClick={maximizeCall}>
                <div className="whatsapp-minimized-avatar">
                  {selectedConversation?.name?.charAt(0) || '👤'}
                </div>
                <div className="whatsapp-minimized-info">
                  <span className="whatsapp-minimized-name">{selectedConversation?.name}</span>
                  <span className="whatsapp-minimized-duration">
                    {callState === 'connected' ? formatCallDuration(callDuration) : 'Calling...'}
                  </span>
                </div>
                <div className="whatsapp-minimized-controls">
                  <button
                    className="whatsapp-minimized-mute"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                  >
                    {isMuted ? '🔇' : '🎤'}
                  </button>
                  <button
                    className="whatsapp-minimized-end"
                    onClick={(e) => {
                      e.stopPropagation();
                      endCall();
                    }}
                  >
                    📞
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Image Lightbox */}
      {lightboxImage && (
        <div 
          className="chat-lightbox-overlay" 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
        >
          {/* Close button — always visible top-right */}
          <button 
            onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
            style={{
              position: 'fixed',
              top: 16, right: 16,
              background: '#dc2626',
              border: '3px solid white',
              width: 52, height: 52,
              borderRadius: '50%',
              fontSize: 24,
              fontWeight: 'bold',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100001,
              boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
              lineHeight: 1
            }}
          >✕</button>

          {/* Tap-to-close hint */}
          <div style={{ position: 'fixed', bottom: 20, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13, zIndex: 100000 }}>
            Tap outside or press ✕ to close
          </div>

          <img 
            src={lightboxImage} 
            alt="Full size" 
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.target.style.display = 'none';
              const d = document.createElement('div');
              d.style.color = 'white';
              d.style.textAlign = 'center';
              d.style.padding = '40px';
              d.innerHTML = `<div style="font-size:48px;margin-bottom:16px">🖼️</div><div>Could not load image</div><small style="opacity:0.6">${lightboxImage}</small>`;
              e.target.parentNode.appendChild(d);
            }}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: 8,
              boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
