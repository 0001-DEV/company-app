<<<<<<< HEAD
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import PollWidget from "../components/PollWidget";

const EMOJI_CATEGORIES = [
  { label: "😀", name: "Smileys", emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"] },
  { label: "👋", name: "People", emojis: ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🙏","✍️","💅","🤳","💪","🦾","🦵","🦶","👃","👀","👅","👄","💋","👶","🧒","👦","👧","🧑","👱","👨","🧔","👩","🧓","👴","👵","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇","🤦","🤷"] },
  { label: "❤️", name: "Hearts", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟"] },
  { label: "🐶", name: "Animals", emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷️","🦂","🐢","🐍","🦎","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅","🐆","🦓","🦍","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🐈","🐓","🦃","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦦","🐁","🐀","🐿️","🦔"] },
  { label: "🍎", name: "Food", emojis: ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🫓","🥪","🥙","🧆","🌮","🌯","🫔","🥗","🥘","🫕","🥫","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥮","🍢","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯","🧃","🥤","🧋","☕","🍵","🫖","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧉","🍾","🧊","🥄","🍴","🍽️","🥢","🧂"] },
  { label: "⚽", name: "Activity", emojis: ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","⛳","🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷","⛸️","🥌","🎿","⛷️","🏂","🪂","🏋️","🤼","⛹️","🤺","🏇","🧘","🏄","🏊","🤽","🚣","🧗","🚴","🏆","🥇","🥈","🥉","🏅","🎖️","🏵️","🎗️","🎫","🎟️","🎪","🤹","🎭","🩰","🎨","🎬","🎤","🎧","🎼","🎹","🥁","🪘","🎷","🎺","🎸","🪕","🎻","🎲","♟️","🎯","🎳","🎮","🎰","🧩"] },
  { label: "🚗", name: "Travel", emojis: ["🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🏍️","🛵","🛺","🚲","🛴","🛹","🛼","🚏","🛣️","🛤️","⛽","🚨","🚥","🚦","🛑","🚧","⚓","🛟","⛵","🛥️","🛳️","⛴️","🚢","✈️","🛩️","🛫","🛬","🪂","💺","🚁","🚟","🚠","🚡","🛰️","🚀","🛸","🪐","🌍","🌎","🌏","🌐","🗺️","🧭","🏔️","⛰️","🌋","🗻","🏕️","🏖️","🏜️","🏝️","🏞️","🏟️","🏛️","🏗️","🧱","🪨","🪵","🛖","🏘️","🏚️","🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏨","🏩","🏪","🏫","🏬","🏭","🏯","🏰","💒","🗼","🗽","⛪","🕌","🛕","🕍","⛩️","🕋"] },
  { label: "💡", name: "Objects", emojis: ["💡","🔦","🕯️","🪔","🧯","🛢️","💰","💴","💵","💶","💷","💸","💳","🪙","💹","📈","📉","📊","📋","🗒️","🗓️","📆","📅","🗑️","📁","📂","🗂️","🗃️","🗄️","📌","📍","✂️","🖇️","📎","🖊️","🖋️","✒️","🖌️","🖍️","📝","✏️","🔍","🔎","🔏","🔐","🔒","🔓"] },
];

const QUICK_REACTIONS = ["👍","❤️","😂","😮","😢","🙏","🔥","👏"];

const EmojiPicker = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  const filtered = search
    ? EMOJI_CATEGORIES.flatMap(c => c.emojis).filter(e => e.includes(search))
    : EMOJI_CATEGORIES[activeCategory].emojis;
  return (
    <div ref={ref} style={EP.wrap}>
      <div style={EP.searchRow}>
        <input autoFocus placeholder="Search emoji..." value={search} onChange={e => setSearch(e.target.value)} style={EP.searchInput} />
      </div>
      <div style={EP.catRow}>
        {EMOJI_CATEGORIES.map((c, i) => (
          <button key={i} title={c.name} style={{ ...EP.catBtn, ...(activeCategory === i && !search ? EP.catBtnActive : {}) }}
            onClick={() => { setActiveCategory(i); setSearch(""); }}>{c.label}</button>
        ))}
      </div>
      {!search && <div style={EP.catName}>{EMOJI_CATEGORIES[activeCategory].name}</div>}
      <div style={EP.grid}>
        {filtered.map((emoji, i) => (
          <button key={i} style={EP.emojiBtn} onClick={() => onSelect(emoji)}>{emoji}</button>
        ))}
        {filtered.length === 0 && <div style={EP.noResult}>No emoji found</div>}
      </div>
    </div>
  );
};

const EP = {
  wrap: { position: "absolute", bottom: 60, left: 0, width: 320, background: "#1e293b", border: "1px solid #334155", borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,0.5)", zIndex: 200, overflow: "hidden", maxWidth: "100vw" },
  searchRow: { padding: "10px 12px 6px" },
  searchInput: { width: "100%", padding: "8px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: 50, color: "#f1f5f9", fontSize: 13, outline: "none", boxSizing: "border-box" },
  catRow: { display: "flex", gap: 2, padding: "4px 10px", borderBottom: "1px solid #334155", overflowX: "auto" },
  catBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: "4px 6px", borderRadius: 8, flexShrink: 0 },
  catBtnActive: { background: "#334155" },
  catName: { padding: "6px 14px 2px", fontSize: 11, color: 'var(--text-muted, #64748b)', fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2, padding: "6px 10px 10px", maxHeight: 220, overflowY: "auto" },
  emojiBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: "4px", borderRadius: 6, lineHeight: 1 },
  noResult: { gridColumn: "1/-1", textAlign: "center", color: 'var(--text-muted, #64748b)', padding: "20px", fontSize: 13 },
};

const MiniEmojiPicker = ({ onSelect, onClose, isOwn }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return (
    <div ref={ref} style={{ position: "absolute", top: "100%", ...(isOwn ? { right: 0 } : { left: 0 }), background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "8px 10px", zIndex: 200, display: "flex", gap: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", flexWrap: "wrap", maxWidth: 220 }}>
      {QUICK_REACTIONS.map(emoji => (
        <button key={emoji} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: "3px", borderRadius: 8, lineHeight: 1 }}
          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onSelect(emoji); }}>{emoji}</button>
      ))}
    </div>
  );
};

const renderMentions = (text, currentUserName, staffList = []) => {
  if (!text || !currentUserName) return text;
  // Build regex from known staff names (longest first to avoid partial matches)
  const names = staffList.map(s => s.name).filter(Boolean);
  names.sort((a, b) => b.length - a.length);
  if (!names.length) return text;
  const escaped = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(@(?:${escaped.join('|')}))`, 'gi');
  const parts = text.split(pattern);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      const mentioned = part.slice(1).trim().toLowerCase();
      const isMe = currentUserName.toLowerCase() === mentioned;
      return <span key={i} style={{ color: isMe ? "#60a5fa" : "#93c5fd", fontWeight: isMe ? 700 : 600, background: isMe ? "rgba(96,165,250,0.12)" : "transparent", borderRadius: 4, padding: "0 2px" }}>{part}</span>;
    }
    return part;
  });
};

const ChatBox = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState("none");
  const [staffLoading, setStaffLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDepartments, setShowDepartments] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [editingMessage, setEditingMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingNames, setTypingNames] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [forwardMsg, setForwardMsg] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [jitsiRoom, setJitsiRoom] = useState(null);
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState(null);
  const ringAudioRef = useRef(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupAdmins, setGroupAdmins] = useState([]);
  const [groupInfoLoading, setGroupInfoLoading] = useState(false);
  const [onlyAdminsCanSend, setOnlyAdminsCanSend] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinnedBanner, setShowPinnedBanner] = useState(true);
  const [starredMessages, setStarredMessages] = useState([]);
  const [showStarred, setShowStarred] = useState(false);
  const [readByPopup, setReadByPopup] = useState(null);
  const [mutedChats, setMutedChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mutedChats") || "{}"); } catch { return {}; }
  });
  const [showMuteMenu, setShowMuteMenu] = useState(false);
  const [deptSectionOpen, setDeptSectionOpen] = useState(false);
  const [dmSectionOpen, setDmSectionOpen] = useState(true);
  const [mediaSubTab, setMediaSubTab] = useState("photos");
  const [mediaMessages, setMediaMessages] = useState([]);
  const [groupInfoTab, setGroupInfoTab] = useState("members");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [disappearAfterDays, setDisappearAfterDays] = useState(0);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleText, setScheduleText] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduledMsgs, setScheduledMsgs] = useState([]);
  const [showScheduledList, setShowScheduledList] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionCandidates, setMentionCandidates] = useState([]);
  const [showCtxReactPicker, setShowCtxReactPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [autoDownload, setAutoDownload] = useState(() => {
    try { return JSON.parse(localStorage.getItem("autoDownload") || '{"images":false,"videos":false,"documents":false}'); } catch { return { images: false, videos: false, documents: false }; }
  });
  const [showAutoDownloadMenu, setShowAutoDownloadMenu] = useState(false);
  const [missedCallToast, setMissedCallToast] = useState(null);
  const [myStatus, setMyStatus] = useState(() => {
    try { return JSON.parse(localStorage.getItem("myStatus") || "null") || { status: "", emoji: "🟢" }; } catch { return { status: "", emoji: "🟢" }; }
  });
  const [peerStatuses, setPeerStatuses] = useState({});
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevMsgCountRef = useRef(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const incomingCallRef = useRef(null);
  const activeCallRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => { localStorage.setItem("mutedChats", JSON.stringify(mutedChats)); }, [mutedChats]);
  useEffect(() => { localStorage.setItem("autoDownload", JSON.stringify(autoDownload)); }, [autoDownload]);
  useEffect(() => { localStorage.setItem("myStatus", JSON.stringify(myStatus)); }, [myStatus]);
  useEffect(() => { incomingCallRef.current = incomingCall; }, [incomingCall]);
  useEffect(() => { activeCallRef.current = activeCall; }, [activeCall]);

  // Jitsi
  useEffect(() => {
    if (!jitsiRoom) { if (jitsiApiRef.current) { jitsiApiRef.current.dispose(); jitsiApiRef.current = null; } return; }
    const loadJitsi = () => {
      if (!jitsiContainerRef.current) return;
      if (jitsiApiRef.current) { jitsiApiRef.current.dispose(); jitsiApiRef.current = null; }
      const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName: jitsiRoom.roomName,
        parentNode: jitsiContainerRef.current,
        width: "100%", height: "100%",
        userInfo: { displayName: jitsiRoom.displayName },
        configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: jitsiRoom.callType === "voice", prejoinPageEnabled: false },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: jitsiRoom.callType === "voice" ? ["microphone","hangup","chat","desktop"] : ["microphone","camera","hangup","chat","tileview","desktop"],
          SHOW_JITSI_WATERMARK: false, SHOW_BRAND_WATERMARK: false,
        },
      });
      api.addEventListener("readyToClose", () => { setJitsiRoom(null); });
      jitsiApiRef.current = api;
    };
    if (window.JitsiMeetExternalAPI) { loadJitsi(); }
    else {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.onload = loadJitsi;
      document.head.appendChild(script);
    }
    return () => { if (jitsiApiRef.current) { jitsiApiRef.current.dispose(); jitsiApiRef.current = null; } };
  }, [jitsiRoom]);

  // Heartbeat
  useEffect(() => {
    if (!currentUser) return;
    const beat = async () => { try { const token = localStorage.getItem("token"); await fetch("http://localhost:5000/api/chat/heartbeat", { method: "POST", headers: { Authorization: `Bearer ${token}` } }); } catch (_) {} };
    beat(); const iv = setInterval(beat, 20000); return () => clearInterval(iv);
  }, [currentUser]);

  // Online status
  useEffect(() => {
    if (!currentUser || staffList.length === 0) return;
    const fetchOnline = async () => {
      try {
        const token = localStorage.getItem("token");
        const ids = staffList.map(s => s._id).join(",");
        const res = await fetch(`http://localhost:5000/api/chat/online-status?ids=${ids}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setOnlineStatus(await res.json());
      } catch (_) {}
    };
    fetchOnline(); const iv = setInterval(fetchOnline, 15000); return () => clearInterval(iv);
  }, [currentUser, staffList]);

  // Peer statuses
  useEffect(() => {
    if (!currentUser || staffList.length === 0) return;
    const fetchStatuses = async () => {
      try {
        const token = localStorage.getItem("token");
        const ids = staffList.map(s => s._id).join(",");
        const res = await fetch(`http://localhost:5000/api/features/status?ids=${ids}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setPeerStatuses(await res.json());
      } catch (_) {}
    };
    fetchStatuses(); const iv = setInterval(fetchStatuses, 15000); return () => clearInterval(iv);
  }, [currentUser, staffList]);

  // Typing
  useEffect(() => {
    if (!currentUser) return;
    const getConvKey = () => {
      if (viewMode === "private" && selectedUser) return `private:${[currentUser.id, selectedUser].sort().join(":")}`;
      if (viewMode === "department" && selectedDepartment) return `dept:${selectedDepartment._id}`;
      return "all";
    };
    const fetchTyping = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/chat/typing?conversationKey=${getConvKey()}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setTypingNames(await res.json());
      } catch (_) {}
    };
    const iv = setInterval(fetchTyping, 2000); return () => clearInterval(iv);
  }, [currentUser, viewMode, selectedUser, selectedDepartment]);

  // Auth
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { setError("Please log in first to use chat"); setLoading(false); return; }
        const response = await fetch("http://localhost:5000/api/chat/me", { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) { setCurrentUser(await response.json()); }
        else { const d = await response.json(); setError(`Authentication failed: ${d.message || "Unknown error"}`); }
      } catch (err) { setError(`Error connecting to server: ${err.message}`); }
      finally { setLoading(false); }
    };
    fetchCurrentUser();
  }, []);

  // Staff list + departments
  useEffect(() => {
    if (!currentUser) return;
    const fetchStaffList = async () => {
      setStaffLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/chat/users", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setStaffList(await res.json());
      } catch (err) { console.error(err); } finally { setStaffLoading(false); }
    };
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/admin/fixed-departments", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setDepartments(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchStaffList(); fetchDepartments();
  }, [currentUser]);

  // Auto-open DM from ?dm= query param (e.g. from birthday notification)
  useEffect(() => {
    if (!staffList.length) return;
    const params = new URLSearchParams(location.search);
    const dmId = params.get('dm');
    if (dmId) {
      setSelectedUser(dmId);
      setViewMode('private');
    }
  }, [location.search, staffList]);

  // Unread counts
  useEffect(() => {
    if (!currentUser) return;
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/chat/unread-counts", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setUnreadCounts(await res.json());
      } catch (err) {}
    };
    fetchUnread(); const iv = setInterval(fetchUnread, 5000); return () => clearInterval(iv);
  }, [currentUser]);

  // Last messages
  useEffect(() => {
    if (!currentUser) return;
    const fetchLast = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/chat/last-messages", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setLastMessages(await res.json());
      } catch (err) {}
    };
    fetchLast(); const iv = setInterval(fetchLast, 5000); return () => clearInterval(iv);
  }, [currentUser]);

  // Messages
  useEffect(() => {
    if (!currentUser || viewMode === "none") return;
    const loadMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        let url = "http://localhost:5000/api/chat/messages";
        if (viewMode === "private" && selectedUser) url += `?userId=${selectedUser}`;
        else if (viewMode === "department" && selectedDepartment) url += `?departmentId=${selectedDepartment._id}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setMessages(await res.json());
      } catch (err) {}
    };
    loadMessages(); const iv = setInterval(loadMessages, 3000); return () => clearInterval(iv);
  }, [currentUser, selectedUser, viewMode, selectedDepartment]);

  // Starred
  useEffect(() => {
    if (!currentUser) return;
    const fetchStarred = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/chat/starred", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setStarredMessages(await res.json());
      } catch (_) {}
    };
    fetchStarred();
  }, [currentUser]);

  // Pinned
  useEffect(() => {
    if (viewMode !== "department" || !selectedDepartment) { setPinnedMessages([]); return; }
    const fetchPins = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/chat/pins?departmentId=${selectedDepartment._id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setPinnedMessages(await res.json());
      } catch (_) {}
    };
    fetchPins(); const iv = setInterval(fetchPins, 10000); return () => clearInterval(iv);
  }, [viewMode, selectedDepartment]);

  // Media gallery
  useEffect(() => {
    if (!showGroupInfo || !selectedDepartment || groupInfoTab !== "media") return;
    const fetchMedia = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/chat/media?departmentId=${selectedDepartment._id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setMediaMessages(await res.json());
      } catch (_) {}
    };
    fetchMedia();
  }, [showGroupInfo, selectedDepartment, groupInfoTab]);

  // Scroll + auto-download
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    const lastMsg = messages[messages.length - 1];
    const isOwnMsg = lastMsg?.senderId?.toString() === currentUser?.id;
    const newMsgArrived = messages.length > prevMsgCountRef.current;
    prevMsgCountRef.current = messages.length;
    if (newMsgArrived && (isNearBottom || isOwnMsg)) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    if (newMsgArrived && lastMsg && lastMsg.senderId?.toString() !== currentUser?.id) {
      (lastMsg.files || []).forEach(file => {
        const fname = file.originalName || file.path?.split("/").pop() || "file";
        const fpath = file.path?.replace(/\\/g, "/");
        const adSettings = JSON.parse(localStorage.getItem("autoDownload") || "{}");
        if (isImageFile(fname) && adSettings.images) { const a = document.createElement("a"); a.href = `http://localhost:5000/${fpath}`; a.download = fname; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
        else if (isVideoFile(fname) && adSettings.videos) { const a = document.createElement("a"); a.href = `http://localhost:5000/${fpath}`; a.download = fname; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
        else if (!isImageFile(fname) && !isVideoFile(fname) && !isAudioFile(fname) && adSettings.documents) { const a = document.createElement("a"); a.href = `http://localhost:5000/${fpath}`; a.download = fname; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
      });
    }
  }, [messages, currentUser]);

  // Context menu close
  useEffect(() => {
    const close = () => { if (contextMenu) { setContextMenu(null); setShowCtxReactPicker(false); } };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [contextMenu]);

  useEffect(() => {
    const close = () => { setShowMuteMenu(false); setShowAutoDownloadMenu(false); setShowStatusMenu(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // Incoming call poll
  useEffect(() => {
    if (!currentUser) return;
    const poll = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/chat/call/incoming", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const call = await res.json();
        const current = incomingCallRef.current;
        const busy = activeCallRef.current;
        if (call && !current && !busy) { setIncomingCall(call); startRing(true); }
        else if (!call && current) {
          stopRing();
          setMissedCallToast({ callerName: current.callerName, callType: current.callType });
          setTimeout(() => setMissedCallToast(null), 5000);
          setIncomingCall(null);
          try {
            const t = localStorage.getItem("token");
            const [msgRes, lastRes] = await Promise.all([
              fetch("http://localhost:5000/api/chat/messages", { headers: { Authorization: `Bearer ${t}` } }),
              fetch("http://localhost:5000/api/chat/last-messages", { headers: { Authorization: `Bearer ${t}` } }),
            ]);
            if (msgRes.ok) setMessages(await msgRes.json());
            if (lastRes.ok) setLastMessages(await lastRes.json());
          } catch (_) {}
        }
      } catch (_) {}
    };
    const iv = setInterval(poll, 2000);
    return () => clearInterval(iv);
  }, [currentUser]);

  // Outgoing call status poll
  useEffect(() => {
    if (!activeCall) return;
    const poll = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/chat/call/status/${activeCall.callId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const { status } = await res.json();
          if (status === "accepted") {
            stopRing(); setCallStatus("accepted");
            setJitsiRoom({ roomName: activeCall.roomName, callType: activeCall.callType, displayName: currentUser?.name });
            setActiveCall(null);
          } else if (status === "ended") {
            stopRing(); setActiveCall(null); setCallStatus("ended");
            setTimeout(() => setCallStatus(null), 2000);
          }
        }
      } catch (_) {}
    };
    const iv = setInterval(poll, 2000);
    return () => clearInterval(iv);
  }, [activeCall]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isImageFile = (name) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name);
  const isVideoFile = (name) => /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(name);
  const isAudioFile = (name) => /\.(mp3|wav|ogg|m4a|webm|aac)$/i.test(name);
  const getInitials = (name) => (name || "?").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  const isChatMuted = (key) => { const m = mutedChats[key]; if (!m) return false; if (m === true) return true; return new Date(m) > new Date(); };

  const markAsRead = async (userId, opts = {}) => {
    try {
      const token = localStorage.getItem("token");
      const body = userId ? { userId } : opts;
      await fetch("http://localhost:5000/api/chat/messages/mark-read", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const res = await fetch("http://localhost:5000/api/chat/unread-counts", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUnreadCounts(await res.json());
    } catch (_) {}
  };

  const saveStatus = async (status, emoji) => {
    const newStatus = { status, emoji };
    setMyStatus(newStatus);
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/features/status", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newStatus)
      });
    } catch (_) {}
  };

  const reloadMessages = async () => {
    const token = localStorage.getItem("token");
    let url = "http://localhost:5000/api/chat/messages";
    if (viewMode === "private" && selectedUser) url += `?userId=${selectedUser}`;
    else if (viewMode === "department" && selectedDepartment) url += `?departmentId=${selectedDepartment._id}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      setMessages(await res.json());
      if (viewMode === "private" && selectedUser) markAsRead(selectedUser);
      else if (viewMode === "department" && selectedDepartment) markAsRead(null, { departmentId: selectedDepartment._id });
      else if (viewMode === "all") markAsRead(null, { teamChat: true });
    }
  };

  const sendMessage = async () => {
    if (!text.trim() && selectedFiles.length === 0) return;
    try {
      const token = localStorage.getItem("token");
      let receiverId = "all";
      if (viewMode === "private" && selectedUser) receiverId = selectedUser;
      else if (viewMode === "department" && selectedDepartment) receiverId = `department:${selectedDepartment._id}`;
      const formData = new FormData();
      formData.append("text", text);
      formData.append("receiverId", receiverId);
      if (replyingTo) formData.append("replyToId", replyingTo._id);
      selectedFiles.forEach(f => formData.append("files", f));
      const res = await fetch("http://localhost:5000/api/chat/message", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (res.ok) { setText(""); setSelectedFiles([]); setReplyingTo(null); setShowMentionDropdown(false); reloadMessages(); }
      else { const d = await res.json(); alert(`Failed: ${d.message}`); }
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const notifyTyping = async (isTyping) => {
    try {
      const token = localStorage.getItem("token");
      let convKey = "all";
      if (viewMode === "private" && selectedUser) convKey = `private:${[currentUser.id, selectedUser].sort().join(":")}`;
      else if (viewMode === "department" && selectedDepartment) convKey = `dept:${selectedDepartment._id}`;
      await fetch("http://localhost:5000/api/chat/typing", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversationKey: convKey, isTyping })
      });
    } catch (_) {}
  };

  const getMentionCandidates = () => {
    const names = new Set();
    if (viewMode === "private" && selectedUser) {
      const peer = staffList.find(s => s._id === selectedUser);
      if (peer) names.add(peer.name);
    } else if (viewMode === "department" && selectedDepartment) {
      groupMembers.forEach(m => { if (m._id !== currentUser?.id) names.add(m.name); });
    } else {
      staffList.forEach(s => names.add(s.name));
    }
    names.delete(currentUser?.name);
    return [...names];
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    notifyTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => notifyTyping(false), 3000);
    const cursor = e.target.selectionStart;
    const before = val.slice(0, cursor);
    // Match @ followed by any characters (including spaces) until end of typed segment
    const match = before.match(/@([^@]*)$/);
    if (match) {
      const q = match[1].toLowerCase();
      const candidates = getMentionCandidates().filter(n => n.toLowerCase().startsWith(q));
      setMentionCandidates(candidates);
      setShowMentionDropdown(candidates.length > 0);
    } else { setShowMentionDropdown(false); }
  };

  const insertMention = (name) => {
    const el = inputRef.current;
    const cursor = el?.selectionStart || text.length;
    const before = text.slice(0, cursor);
    const after = text.slice(cursor);
    // Replace everything after the last @ up to cursor
    const newBefore = before.replace(/@[^@]*$/, `@${name} `);
    setText(newBefore + after);
    setShowMentionDropdown(false);
    setMentionCandidates([]);
    setTimeout(() => el?.focus(), 0);
  };

  const startRing = (incoming = false) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ringAudioRef.current = ctx;
      const playNote = (freq, start, dur, vol = 0.25, type = "sine") => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
        gain.gain.setValueAtTime(vol, ctx.currentTime + start + dur - 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };
      if (incoming) {
        const playRing = () => {
          const notes = [523, 659, 784, 1047];
          notes.forEach((f, i) => playNote(f, i * 0.18, 0.16, 0.3));
          playNote(1047, 0.72, 0.3, 0.25);
        };
        playRing();
        const iv = setInterval(playRing, 2500);
        ctx._ringInterval = iv;
      } else {
        const playDial = () => {
          playNote(440, 0, 0.4, 0.2, "sine");
          playNote(480, 0, 0.4, 0.15, "sine");
        };
        playDial();
        const iv = setInterval(playDial, 1800);
        ctx._ringInterval = iv;
      }
    } catch (_) {}
  };

  const stopRing = () => {
    try {
      if (ringAudioRef.current) {
        if (ringAudioRef.current._ringInterval) clearInterval(ringAudioRef.current._ringInterval);
        ringAudioRef.current.close();
        ringAudioRef.current = null;
      }
    } catch (_) {}
  };

  const startCall = async (type) => {
    if (!selectedUser && viewMode !== "department") return;
    let roomName, receiverId, receiverName;
    if (viewMode === "private" && selectedUser) {
      const peer = staffList.find(s => s._id === selectedUser);
      const ids = [currentUser.id, selectedUser].sort().join("-");
      roomName = `xtreme-${type}-${ids}`;
      receiverId = selectedUser;
      receiverName = peer?.name || selectedUser;
    } else if (viewMode === "department" && selectedDepartment) {
      roomName = `xtreme-${type}-dept-${selectedDepartment._id}`;
      receiverId = selectedDepartment._id;
      receiverName = selectedDepartment.name;
    } else return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/chat/call/initiate", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverId, callType: type, roomName })
      });
      if (res.ok) {
        const { callId } = await res.json();
        setActiveCall({ callId, roomName, callType: type, receiverName });
        startRing(false);
      }
    } catch (_) {}
  };

  const endCall = async () => {
    stopRing();
    if (activeCall) {
      try {
        const token = localStorage.getItem("token");
        await fetch("http://localhost:5000/api/chat/call/end", {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ callId: activeCall.callId })
        });
      } catch (_) {}
      setActiveCall(null);
    }
    setCallStatus(null);
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    stopRing();
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/chat/call/respond", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ callId: incomingCall.callId, action: "accept" })
      });
      setJitsiRoom({ roomName: incomingCall.roomName, callType: incomingCall.callType, displayName: currentUser?.name });
      setIncomingCall(null);
    } catch (_) {}
  };

  const declineCall = async () => {
    if (!incomingCall) return;
    stopRing();
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/chat/call/respond", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ callId: incomingCall.callId, action: "decline" })
      });
    } catch (_) {}
    setIncomingCall(null);
  };

  const handleReact = async (msgId, emoji) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/chat/messages/${msgId}/react`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emoji })
      });
      if (res.ok) reloadMessages();
    } catch (_) {}
  };

  const handlePin = async (msgId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/chat/messages/${msgId}/pin`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` }
      });
      reloadMessages();
    } catch (_) {}
  };

  const handleStar = async (msgId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/chat/messages/${msgId}/star`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { const d = await res.json(); setStarredMessages(d.starredMessages); }
    } catch (_) {}
  };

  const handleReadBy = async (msgId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/chat/messages/${msgId}/read-by`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setReadByPopup({ msgId, names: d.names }); }
    } catch (_) {}
  };

  const handleEdit = async (msgId, newText) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/chat/messages/${msgId}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: newText })
      });
      if (res.ok) { setEditingMessage(null); reloadMessages(); }
      else { const d = await res.json(); alert(d.message); }
    } catch (_) {}
  };

  const handleDelete = async (msgId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/chat/messages/${msgId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) reloadMessages();
      else { const d = await res.json(); alert(d.message); }
    } catch (_) {}
  };

  const handleForward = async (targetId) => {
    if (!forwardMsg) return;
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("text", forwardMsg.text || "");
      formData.append("receiverId", targetId);
      formData.append("forwardedFrom", forwardMsg.senderName);
      await fetch("http://localhost:5000/api/chat/message", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData
      });
      setShowForwardModal(false); setForwardMsg(null);
    } catch (_) {}
  };

  const handleMessageClick = (msg, e) => {
    e.stopPropagation();
    setContextMenu({ msg, x: e.clientX, y: e.clientY });
    setShowCtxReactPicker(false);
  };

  const isGroupAdminOrAdmin = () => {
    if (currentUser?.role === "admin") return true;
    const myId = currentUser?.id?.toString();
    return (groupAdmins || []).some(id => id?.toString() === myId);
  };

  const toggleGroupAdmin = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/department-group-admin/${selectedDepartment._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId })
      });
      if (res.ok) { const d = await res.json(); setGroupAdmins(d.groupAdmins); }
    } catch (_) {}
  };

  const toggleGroupSetting = async (key, value) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/department-settings/${selectedDepartment._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [key]: value })
      });
      if (res.ok) { if (key === "onlyAdminsCanSend") setOnlyAdminsCanSend(value); }
    } catch (_) {}
  };

  const updateDisappearSetting = async (days) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/chat/department-settings/${selectedDepartment._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ disappearAfterDays: days })
      });
      if (res.ok) setDisappearAfterDays(days);
    } catch (_) {}
  };

  const loadGroupInfo = async (dept) => {
    setGroupInfoLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/admin/department-members/${dept._id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setGroupMembers(d.members);
        setGroupAdmins(d.groupAdmins);
        setOnlyAdminsCanSend(d.onlyAdminsCanSend || false);
        setDisappearAfterDays(d.disappearAfterDays || 0);
      }
    } catch (_) {}
    setGroupInfoLoading(false);
  };

  const fetchScheduledMsgs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/extras/scheduled-messages", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setScheduledMsgs(await res.json());
    } catch (_) {}
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleText.trim() || !scheduleAt) return;
    try {
      const token = localStorage.getItem("token");
      let receiverId = "all";
      if (viewMode === "private" && selectedUser) receiverId = selectedUser;
      else if (viewMode === "department" && selectedDepartment) receiverId = `department:${selectedDepartment._id}`;
      const res = await fetch("http://localhost:5000/api/extras/scheduled-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverId, text: scheduleText, scheduledAt: scheduleAt })
      });
      if (res.ok) {
        setScheduleText(""); setScheduleAt(""); setShowScheduleModal(false);
        fetchScheduledMsgs();
      }
    } catch (_) {}
  };

  const handleDeleteScheduled = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:5000/api/extras/scheduled-messages/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setScheduledMsgs(prev => prev.filter(m => m._id !== id));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: "audio/webm" });
        stream.getTracks().forEach(t => t.stop());
        const token = localStorage.getItem("token");
        let receiverId = "all";
        if (viewMode === "private" && selectedUser) receiverId = selectedUser;
        else if (viewMode === "department" && selectedDepartment) receiverId = `department:${selectedDepartment._id}`;
        const formData = new FormData();
        formData.append("text", "🎤 Voice note");
        formData.append("receiverId", receiverId);
        formData.append("files", file);
        await fetch("http://localhost:5000/api/chat/message", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
        reloadMessages();
      };
      mr.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (_) { alert("Microphone access denied"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const muteChat = (key, duration) => {
    if (duration === 0) {
      setMutedChats(prev => { const n = { ...prev }; delete n[key]; return n; });
    } else if (duration === -1) {
      setMutedChats(prev => ({ ...prev, [key]: true }));
    } else {
      const until = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();
      setMutedChats(prev => ({ ...prev, [key]: until }));
    }
    setShowMuteMenu(false);
  };

  // Sort staff by last message time
  const sortedStaff = [...staffList].sort((a, b) => {
    const la = lastMessages[a._id]?.createdAt;
    const lb = lastMessages[b._id]?.createdAt;
    if (!la && !lb) return 0;
    if (!la) return 1;
    if (!lb) return -1;
    return new Date(lb) - new Date(la);
  });

  const filteredStaff = sortedStaff.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDepts = departments.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return (
    <div style={S.center}>
      <div style={S.spinner} />
      <div style={{ color: 'var(--text-muted, #64748b)', marginTop: 16, fontSize: 14 }}>Loading chat...</div>
    </div>
  );

  if (error) return (
    <div style={S.center}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <div style={{ color: "#ef4444", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{error}</div>
      <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Retry</button>
    </div>
  );

  return (
    <div style={S.root}>
      {/* ── SIDEBAR ── */}
      <div style={{ ...S.sidebar, display: isMobile && viewMode !== "none" ? "none" : "flex" }}>
        <div style={S.sidebarHeader}>
          <div style={S.sidebarTitle}>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#e9edef" }}>Chats</span>
          </div>
          <div style={S.searchWrap}>
            <span style={S.searchIcon}>🔍</span>
            <input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={S.searchInput}
            />
          </div>
        </div>

        <div style={S.sidebarList}>
          {/* Team Chat (admin only) */}
          {currentUser?.role === "admin" && (
            <div
              style={{ ...S.sidebarItem, ...(viewMode === "all" ? S.sidebarItemActive : {}) }}
              onClick={() => { setViewMode("all"); setSelectedUser(null); setSelectedDepartment(null); markAsRead(null, { teamChat: true }); }}
            >
              <div style={{ ...S.avatar, background: "linear-gradient(135deg,#f59e0b,#d97706)", width: 40, height: 40, fontSize: 18 }}>🏢</div>
              <div style={S.sidebarItemInfo}>
                <div style={S.sidebarItemName}>Team Chat</div>
                <div style={S.sidebarItemSub}>All staff</div>
              </div>
              {unreadCounts["all"] > 0 && <div style={S.badge}>{unreadCounts["all"]}</div>}
            </div>
          )}

          {/* ── Departments section ── */}
          <div style={S.sectionHeader} onClick={() => setDeptSectionOpen(v => !v)}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#8696a0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Departments</span>
            <span style={{ color: "#8696a0", fontSize: 12, transition: "transform 0.2s", display: "inline-block", transform: deptSectionOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
          </div>
          {deptSectionOpen && filteredDepts.map(dept => {
            const deptKey = `department:${dept._id}`;
            const muted = isChatMuted(deptKey);
            const unread = unreadCounts[deptKey] || 0;
            const isActive = selectedDepartment?._id === dept._id;
            return (
              <div
                key={dept._id}
                style={{ ...S.sidebarItem, ...(isActive ? S.sidebarItemActive : {}), paddingLeft: 20 }}
                onClick={() => { setViewMode("department"); setSelectedDepartment(dept); setSelectedUser(null); loadGroupInfo(dept); markAsRead(null, { departmentId: dept._id }); }}
              >
                <div style={{ ...S.avatar, background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", width: 38, height: 38, fontSize: 14 }}>
                  {getInitials(dept.name)}
                </div>
                <div style={S.sidebarItemInfo}>
                  <div style={S.sidebarItemName}>{dept.name}</div>
                  <div style={S.sidebarItemSub}>{muted ? "🔇 Muted" : "Group chat"}</div>
                </div>
                {unread > 0 && !muted && <div style={S.badge}>{unread}</div>}
              </div>
            );
          })}

          {/* ── Direct Messages section ── */}
          <div style={S.sectionHeader} onClick={() => setDmSectionOpen(v => !v)}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#8696a0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Direct Messages</span>
            <span style={{ color: "#8696a0", fontSize: 12, transition: "transform 0.2s", display: "inline-block", transform: dmSectionOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
          </div>
          {dmSectionOpen && filteredStaff.map(staff => {
            const isOnline = onlineStatus[staff._id]?.online;
            const lastSeenTs = onlineStatus[staff._id]?.lastSeen;
            const lastSeenText = (() => {
              if (isOnline) return "Online";
              if (!lastSeenTs) return "Offline";
              const diff = Date.now() - lastSeenTs;
              const mins = Math.floor(diff / 60000);
              if (mins < 1) return "Last seen just now";
              if (mins < 60) return `Last seen ${mins}m ago`;
              const hrs = Math.floor(mins / 60);
              if (hrs < 24) return `Last seen ${hrs}h ago`;
              return `Last seen ${Math.floor(hrs / 24)}d ago`;
            })();
            const unread = unreadCounts[staff._id] || 0;
            const isActive = selectedUser === staff._id;
            const muted = isChatMuted(staff._id);
            const peerSt = peerStatuses[staff._id];
            const subtitle = peerSt?.status
              ? `${peerSt.emoji} ${peerSt.status}`
              : lastSeenText;
            return (
              <div
                key={staff._id}
                style={{ ...S.sidebarItem, ...(isActive ? S.sidebarItemActive : {}), paddingLeft: 20 }}
                onClick={() => { setViewMode("private"); setSelectedUser(staff._id); setSelectedDepartment(null); markAsRead(staff._id); }}
              >
                <div style={S.avatarWrap}>
                  <div style={{ ...S.avatar, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", width: 38, height: 38, fontSize: 14 }}>
                    {getInitials(staff.name)}
                  </div>
                  <div style={{ ...S.onlineDot, background: isOnline ? "#22c55e" : "#64748b" }} />
                </div>
                <div style={S.sidebarItemInfo}>
                  <div style={S.sidebarItemName}>{staff.name}</div>
                  <div style={S.sidebarItemSub}>{muted ? "🔇 Muted" : subtitle}</div>
                </div>
                {unread > 0 && !muted && <div style={S.badge}>{unread}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div style={{ ...S.main, display: isMobile && viewMode === "none" ? "none" : "flex" }}>
        {viewMode === "none" ? (
          /* Welcome state */
          <div style={S.welcome}>
            <div style={{ fontSize: 72, marginBottom: 20, opacity: 0.3 }}>💬</div>
            <div style={{ fontSize: 20, fontWeight: 300, color: "#8696a0", marginBottom: 8 }}>Xtreme Cardz Chat</div>
            <div style={{ fontSize: 14, color: "#8696a0", opacity: 0.7 }}>Select a conversation to start messaging</div>
          </div>
        ) : (
          <>
            {/* ── CHAT HEADER ── */}
            <div style={S.chatHeader}>
              {isMobile && (
                <button style={S.backBtn} onClick={() => { setViewMode("none"); setSelectedUser(null); setSelectedDepartment(null); }}>←</button>
              )}
              <div style={S.chatHeaderInfo}>
                <div style={{ ...S.avatar, width: 38, height: 38, fontSize: 15,
                  background: selectedDepartment
                    ? "linear-gradient(135deg,#8b5cf6,#6d28d9)"
                    : viewMode === "all"
                    ? "linear-gradient(135deg,#f59e0b,#d97706)"
                    : "linear-gradient(135deg,#3b82f6,#1d4ed8)"
                }}>
                  {selectedDepartment ? getInitials(selectedDepartment.name) : viewMode === "all" ? "🏢" : getInitials(staffList.find(s => s._id === selectedUser)?.name || "")}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#e9edef" }}>
                    {selectedDepartment ? selectedDepartment.name : viewMode === "all" ? "Team Chat" : (staffList.find(s => s._id === selectedUser)?.name || "")}
                  </div>
                  <div style={{ fontSize: 12, color: "#8696a0" }}>
                    {selectedDepartment
                      ? `${groupMembers?.length || 0} members`
                      : viewMode === "all" ? "All staff"
                      : (onlineStatus[selectedUser]?.online ? "Online" : (() => {
                          const ts = onlineStatus[selectedUser]?.lastSeen;
                          if (!ts) return "Offline";
                          const mins = Math.floor((Date.now() - ts) / 60000);
                          if (mins < 1) return "Last seen just now";
                          if (mins < 60) return `Last seen ${mins}m ago`;
                          const hrs = Math.floor(mins / 60);
                          if (hrs < 24) return `Last seen ${hrs}h ago`;
                          return `Last seen ${Math.floor(hrs / 24)}d ago`;
                        })())}
                  </div>
                </div>
              </div>
              <div style={S.chatHeaderActions}>
                {/* Search */}
                <button style={S.headerBtn} title="Search messages" onClick={() => setShowSearch(v => !v)}>🔍</button>
                {/* Status button */}
                <div style={{ position: "relative" }}>
                  <button style={{ ...S.headerBtn, fontSize: 13, padding: "6px 10px", borderRadius: 6, border: "1px solid #35354f" }}
                    title="Set status"
                    onClick={e => { e.stopPropagation(); setShowStatusMenu(v => !v); setShowMuteMenu(false); setShowAutoDownloadMenu(false); }}>
                    {myStatus?.status ? myStatus.status.slice(0, 10) : "Status"}
                  </button>
                  {showStatusMenu && (
                    <div style={S.statusMenu} onClick={e => e.stopPropagation()}>
                      <div style={S.statusMenuTitle}>Set your status</div>
                      {[
                        { emoji: "🟢", label: "Available" },
                        { emoji: "🔴", label: "Busy" },
                        { emoji: "🌙", label: "Away" },
                        { emoji: "🎯", label: "Focusing" },
                        { emoji: "📵", label: "Do not disturb" },
                      ].map(opt => (
                        <div key={opt.label} style={S.statusOption}
                          onClick={() => { saveStatus(opt.label, opt.emoji); setShowStatusMenu(false); }}>
                          <span>{opt.emoji}</span>
                          <span style={{ fontSize: 13 }}>{opt.label}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', marginTop: 4, paddingTop: 4 }}>
                        <input
                          placeholder="Custom status..."
                          style={{ ...S.statusCustomInput }}
                          onKeyDown={e => {
                            if (e.key === "Enter" && e.target.value.trim()) {
                              saveStatus(e.target.value.trim(), "💬");
                              setShowStatusMenu(false);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Call buttons (DM and group chat) */}
                {((viewMode === "private" && selectedUser) || (viewMode === "department" && selectedDepartment)) && (
                  <>
                    <button style={S.headerBtn} title="Voice call" onClick={() => startCall("voice")}>📞</button>
                    <button style={S.headerBtn} title="Video call" onClick={() => startCall("video")}>📹</button>
                  </>
                )}
                {/* Starred messages */}
                <button style={S.headerBtn} title="Starred messages" onClick={() => setShowStarred(v => !v)}>⭐</button>
                {/* Group info toggle */}
                {selectedDepartment && (
                  <button style={S.headerBtn} title="Group info" onClick={() => setShowGroupInfo(v => !v)}>ℹ️</button>
                )}
                {/* Mute */}
                <div style={{ position: "relative" }}>
                  <button style={S.headerBtn} title="Mute notifications"
                    onClick={e => { e.stopPropagation(); setShowMuteMenu(v => !v); setShowAutoDownloadMenu(false); setShowStatusMenu(false); }}>
                    {isChatMuted(selectedDepartment ? `department:${selectedDepartment._id}` : selectedUser) ? "🔇" : "🔔"}
                  </button>
                  {showMuteMenu && (
                    <div style={S.dropMenu} onClick={e => e.stopPropagation()}>
                      {[
                        { label: "Mute 1 hour", val: 1 },
                        { label: "Mute 8 hours", val: 8 },
                        { label: "Mute 24 hours", val: 24 },
                        { label: "Mute always", val: -1 },
                        { label: "Unmute", val: 0 },
                      ].map(opt => (
                        <div key={opt.label} style={S.dropItem}
                          onClick={() => muteChat(selectedDepartment ? `department:${selectedDepartment._id}` : selectedUser, opt.val)}>
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Auto-download */}
                <div style={{ position: "relative" }}>
                  <button style={S.headerBtn} title="Auto-download" onClick={e => { e.stopPropagation(); setShowAutoDownloadMenu(v => !v); setShowMuteMenu(false); setShowStatusMenu(false); }}>⬇️</button>
                  {showAutoDownloadMenu && (
                    <div style={S.dropMenu} onClick={e => e.stopPropagation()}>
                      <div style={{ padding: "8px 14px 6px", fontSize: 12, color: WA_TEXT_SUB, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Auto-download</div>
                      {["images", "videos", "audio", "documents"].map(type => (
                        <div key={type} style={{ ...S.dropItem, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                          <span style={{ textTransform: "capitalize", fontSize: 14, color: WA_TEXT }}>{type}</span>
                          <div
                            style={{ width: 40, height: 22, borderRadius: 11, background: autoDownload[type] ? "#6366f1" : "#4a4a6a", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
                            onClick={() => setAutoDownload(prev => ({ ...prev, [type]: !prev[type] }))}>
                            <div style={{ position: "absolute", top: 3, left: autoDownload[type] ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: 'var(--bg-card, white)', transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── SEARCH BAR ── */}
            {showSearch && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#182229", borderBottom: "1px solid #2a3942", flexShrink: 0 }}>
                <input
                  autoFocus
                  placeholder="Search messages..."
                  style={{ flex: 1, padding: "8px 14px", borderRadius: 8, border: "none", background: "#2a3942", color: "#e9edef", fontSize: 14, outline: "none" }}
                  onChange={e => setMsgSearchQuery(e.target.value)}
                />
                <button style={{ background: "none", border: "none", color: "#8696a0", fontSize: 18, cursor: "pointer" }} onClick={() => { setShowSearch(false); setMsgSearchQuery(""); }}>✕</button>
              </div>
            )}

            {/* ── PINNED BANNER ── */}
            {pinnedMessages.length > 0 && (() => {
              const pinned = pinnedMessages[pinnedMessages.length - 1];
              return (
                <div style={S.pinnedBanner}
                  onClick={() => {
                    const el = document.getElementById(`msg-${pinned.messageId}`);
                    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.style.transition = "background 0.3s"; el.style.background = "rgba(99,102,241,0.25)"; setTimeout(() => { el.style.background = ""; }, 1800); }
                  }}>
                  <span style={{ fontSize: 14 }}>📌</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, letterSpacing: "0.5px", marginBottom: 1 }}>PINNED MESSAGE</div>
                    <div style={{ fontSize: 13, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pinned?.text || "📎 Attachment"}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "#8696a0", flexShrink: 0 }}>by {pinned?.pinnedBy}</span>
                </div>
              );
            })()}

            {/* ── TYPING INDICATOR ── */}
            {typingNames.length > 0 && (
              <div style={S.typingBar}>
                {typingNames.join(", ")} {typingNames.length === 1 ? "is" : "are"} typing...
              </div>
            )}

            {/* ── MESSAGES LIST ── */}
            <div style={S.messagesList} ref={messagesContainerRef}>
              {(showSearch && msgSearchQuery
                ? messages.filter(m => m.text?.toLowerCase().includes(msgSearchQuery.toLowerCase()))
                : messages
              ).map((msg, idx) => {
                const isOwn = msg.senderId?.toString() === currentUser?.id?.toString();
                const isDeleted = msg.isDeleted;
                const isMissed = msg.isMissedCall;
                const reactionGroups = {};
                (msg.reactions || []).forEach(r => { reactionGroups[r.emoji] = (reactionGroups[r.emoji] || 0) + 1; });
                const isStarred = starredMessages.some(s => s.messageId?.toString() === msg._id?.toString());
                const isPinned = pinnedMessages.some(p => p.messageId?.toString() === msg._id?.toString());
                const replyMsg = msg.replyTo;

                return (
                  <div key={msg._id || idx} id={`msg-${msg._id}`} style={{ ...S.msgRow, justifyContent: isOwn ? "flex-end" : "flex-start" }}>
                    {!isOwn && (
                      <div style={{ ...S.avatar, width: 30, height: 30, fontSize: 12, flexShrink: 0, alignSelf: "flex-end",
                        background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }}>
                        {getInitials(msg.senderName)}
                      </div>
                    )}
                    <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start" }}>
                      {!isOwn && <div style={S.msgSenderName}>{msg.senderName}</div>}
                      {msg.forwardedFrom && (
                        <div style={S.forwardedLabel}>↪ Forwarded from {msg.forwardedFrom}</div>
                      )}
                      {replyMsg && (
                        <div style={S.replyPreview}>
                          <span style={{ fontWeight: 700, fontSize: 11 }}>{replyMsg.senderName}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted, #64748b)', marginLeft: 4 }}>{replyMsg.text}</span>
                        </div>
                      )}
                      <div
                        style={{ ...S.bubble, ...(isOwn ? S.bubbleOwn : S.bubbleOther), ...(isMissed ? S.bubbleMissed : {}) }}
                        onContextMenu={e => handleMessageClick(msg, e)}
                        onClick={e => handleMessageClick(msg, e)}
                      >
                        {isDeleted ? (
                          <span style={{ fontStyle: "italic", color: 'var(--text-lighter, #94a3b8)', fontSize: 13 }}>🚫 This message was deleted</span>
                        ) : (
                          <>
                            {msg.text && !isMissed && <div style={S.msgText}>{renderMentions(msg.text, currentUser?.name, staffList)}</div>}
                            {isMissed && <div style={S.msgText}>{msg.text}</div>}
                            {(msg.files || []).map((file, fi) => {
                              const name = file.originalName || file.path?.split("/").pop() || "file";
                              const url = `http://localhost:5000/${file.path}`;
                              if (isImageFile(name)) return (
                                <img key={fi} src={url} alt={name} style={S.mediaImg}
                                  onClick={() => setMediaPreview({ url, type: "image", name })} />
                              );
                              if (isVideoFile(name)) return (
                                <video key={fi} src={url} controls style={S.mediaImg} />
                              );
                              if (isAudioFile(name)) return (
                                <audio key={fi} src={url} controls style={{ width: "100%", marginTop: 4 }} />
                              );
                              return (
                                <a key={fi} href={url} download={name} style={S.fileLink}>
                                  📎 {name}
                                </a>
                              );
                            })}
                          </>
                        )}
                      </div>
                      <div style={S.msgMeta}>
                        {isStarred && <span title="Starred" style={{ fontSize: 11 }}>⭐</span>}
                        {isPinned && <span title="Pinned" style={{ fontSize: 11 }}>📌</span>}
                        {msg.isEdited && <span style={{ fontSize: 10, color: "#8696a0" }}>edited</span>}
                        <span style={S.msgTime}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {isOwn && (
                          <span style={{ fontSize: 13, color: (msg.readBy?.length || 0) > 1 ? "#53bdeb" : "#8696a0" }}
                            title={`Read by ${msg.readBy?.length || 0}`}
                            onClick={() => handleReadBy(msg._id)}>
                            {(msg.readBy?.length || 0) > 1 ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                      {Object.keys(reactionGroups).length > 0 && (
                        <div style={S.reactionsRow}>
                          {Object.entries(reactionGroups).map(([emoji, count]) => (
                            <span key={emoji} style={S.reactionChip} onClick={() => handleReact(msg._id, emoji)}>
                              {emoji} {count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* ── REPLY PREVIEW BAR ── */}
            {replyingTo && (
              <div style={S.replyBar}>
                <span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600 }}>↩ Replying to {replyingTo.senderName}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted, #64748b)', marginLeft: 8, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{replyingTo.text}</span>
                <button style={S.replyBarClose} onClick={() => setReplyingTo(null)}>✕</button>
              </div>
            )}


            {/* ── INPUT BAR ── */}
            <div style={{ ...S.inputBar, position: "relative" }}>
              {/* @ Mention dropdown — floats above the input bar */}
              {showMentionDropdown && mentionCandidates.length > 0 && (
                <div style={{
                  position: "absolute", bottom: "100%", left: 16, right: 16, zIndex: 300,
                  background: "#1e2a35", border: "1px solid #2a3942", borderRadius: 10,
                  boxShadow: "0 -8px 24px rgba(0,0,0,0.4)", overflow: "hidden", marginBottom: 6,
                  maxHeight: 220, overflowY: "auto"
                }}>
                  <div style={{ padding: "6px 12px 4px", fontSize: 11, color: "#8696a0", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Mention
                  </div>
                  {mentionCandidates.map((name, i) => (
                    <div key={i}
                      onMouseDown={e => { e.preventDefault(); insertMention(name); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#2a3942"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 14, color: "#e9edef", fontWeight: 500 }}>{name}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Emoji picker toggle */}
              <div style={{ position: "relative" }}>
                <button style={S.inputBtn} onClick={() => setShowEmojiPicker(v => !v)}>😊</button>
                {showEmojiPicker && (
                  <div style={{ position: "absolute", bottom: 48, left: 0, zIndex: 200 }}>
                    <EmojiPicker onSelect={em => { setText(prev => prev + em); setShowEmojiPicker(false); }} onClose={() => setShowEmojiPicker(false)} />
                  </div>
                )}
              </div>

              {/* File attach */}
              <label style={S.inputBtn} title="Attach file">
                📎
                <input type="file" multiple style={{ display: "none" }}
                  onChange={e => setSelectedFiles(Array.from(e.target.files))} />
              </label>

              {/* Voice recording */}
              {isRecording ? (
                <button style={{ ...S.inputBtn, color: "#ef4444" }} onClick={stopRecording}>⏹ Stop</button>
              ) : (
                <button style={S.inputBtn} onClick={startRecording}>🎙️</button>
              )}

              {/* Attached files preview */}
              {selectedFiles.length > 0 && (
                <div style={S.attachedPreview}>
                  {selectedFiles.map((f, i) => (
                    <span key={i} style={S.attachedChip}>
                      📎 {f.name}
                      <button style={S.attachedRemove} onClick={() => setSelectedFiles(prev => prev.filter((_, j) => j !== i))}>✕</button>
                    </span>
                  ))}
                </div>
              )}

              <textarea
                style={S.textInput}
                placeholder={`Message ${selectedDepartment ? selectedDepartment.name : "..."}  (@ to mention)`}
                value={text}
                onChange={handleTextChange}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                rows={1}
                ref={inputRef}
              />
              {currentUser?.role === "admin" && (
                <button style={S.inputBtn} title="Schedule message" onClick={() => { setShowScheduleModal(true); fetchScheduledMsgs(); }}>⏱</button>
              )}
              <button style={S.sendBtn} onClick={sendMessage} disabled={!text.trim() && selectedFiles.length === 0}>
                ➤
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── GROUP INFO PANEL ── */}
      {showGroupInfo && selectedDepartment && (
        <div style={S.groupPanel}>
          <div style={S.groupPanelHeader}>
            <span style={{ fontWeight: 600, fontSize: 15, color: "#e9edef" }}>{selectedDepartment.name}</span>
            <button style={S.closeBtn} onClick={() => setShowGroupInfo(false)}>✕</button>
          </div>

          {/* Tabs */}
          <div style={S.tabRow}>
            {["members", "media", "polls", "settings"].map(tab => (
              <button key={tab} style={{ ...S.tabBtn, ...(groupInfoTab === tab ? S.tabBtnActive : {}) }}
                onClick={() => setGroupInfoTab(tab)}>
                {tab === "members" ? "👥" : tab === "media" ? "🖼️" : tab === "polls" ? "📊" : "⚙️"}
                {" "}{tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div style={S.groupPanelBody}>
            {/* Members tab */}
            {groupInfoTab === "members" && (
              <div>
                {(groupMembers || []).map(m => (
                  <div key={m._id} style={S.memberRow}>
                    <div style={{ ...S.avatar, width: 32, height: 32, fontSize: 13, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
                      {getInitials(m.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#e9edef" }}>
                        {m.name}
                        {(groupAdmins || []).some(id => id?.toString() === m._id?.toString()) && (
                          <span title="Group Admin" style={{ marginLeft: 6, fontSize: 13 }}>👑</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#8696a0" }}>{m.role}</div>
                    </div>
                    {currentUser?.role === "admin" && m._id !== currentUser?.id && (() => {
                      const isAdmin = (groupAdmins || []).some(id => id?.toString() === m._id?.toString());
                      return (
                        <button
                          style={{ ...S.smallBtn, ...(isAdmin ? { background: "#7f1d1d", color: "#fca5a5", borderColor: "#ef4444" } : {}) }}
                          onClick={() => toggleGroupAdmin(m._id)}>
                          {isAdmin ? "Remove admin" : "Make admin"}
                        </button>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}

            {/* Media tab */}
            {groupInfoTab === "media" && (
              <div>
                {/* Sub-tabs */}
                <div style={{ display: "flex", gap: 0, marginBottom: 12, borderBottom: "1px solid #2a3942" }}>
                  {["photos", "videos", "audio"].map(sub => (
                    <button key={sub} onClick={() => setMediaSubTab(sub)}
                      style={{ flex: 1, padding: "8px 4px", background: "none", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", color: mediaSubTab === sub ? "#00a884" : "#8696a0", borderBottom: mediaSubTab === sub ? "2px solid #00a884" : "2px solid transparent", textTransform: "capitalize" }}>
                      {sub === "photos" ? "🖼️ Photos" : sub === "videos" ? "🎬 Videos" : "🎵 Audio"}
                    </button>
                  ))}
                </div>

                {mediaSubTab === "photos" && (
                  <div style={S.mediaGrid}>
                    {mediaMessages.flatMap(msg => (msg.files || []).filter(f => isImageFile(f.originalName || ""))).length === 0
                      && <div style={S.emptyState}>No photos shared yet</div>}
                    {mediaMessages.flatMap(msg =>
                      (msg.files || []).filter(f => isImageFile(f.originalName || "")).map((file, i) => (
                        <img key={`${msg._id}-${i}`}
                          src={`http://localhost:5000/${file.path}`}
                          alt={file.originalName}
                          style={S.mediaThumb}
                          onClick={() => setMediaPreview({ url: `http://localhost:5000/${file.path}`, type: "image", name: file.originalName })}
                        />
                      ))
                    )}
                  </div>
                )}

                {mediaSubTab === "videos" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {mediaMessages.flatMap(msg => (msg.files || []).filter(f => isVideoFile(f.originalName || "") && !isAudioFile(f.originalName || ""))).length === 0
                      && <div style={S.emptyState}>No videos shared yet</div>}
                    {mediaMessages.flatMap(msg =>
                      (msg.files || []).filter(f => isVideoFile(f.originalName || "") && !isAudioFile(f.originalName || "")).map((file, i) => (
                        <video key={`${msg._id}-${i}`}
                          src={`http://localhost:5000/${file.path}`}
                          controls
                          style={{ width: "100%", borderRadius: 8, maxHeight: 180 }}
                        />
                      ))
                    )}
                  </div>
                )}

                {mediaSubTab === "audio" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {mediaMessages.flatMap(msg => (msg.files || []).filter(f => isAudioFile(f.originalName || ""))).length === 0
                      && <div style={S.emptyState}>No audio shared yet</div>}
                    {mediaMessages.flatMap(msg =>
                      (msg.files || []).filter(f => isAudioFile(f.originalName || "")).map((file, i) => (
                        <div key={`${msg._id}-${i}`} style={{ background: "#2a3942", borderRadius: 8, padding: "8px 12px" }}>
                          <div style={{ fontSize: 12, color: "#8696a0", marginBottom: 4 }}>{file.originalName}</div>
                          <audio src={`http://localhost:5000/${file.path}`} controls style={{ width: "100%" }} />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Polls tab */}
            {groupInfoTab === "polls" && (
              <PollWidget
                departmentId={selectedDepartment._id}
                currentUser={currentUser}
                isGroupAdmin={isGroupAdminOrAdmin()}
              />
            )}

            {/* Settings tab */}
            {groupInfoTab === "settings" && isGroupAdminOrAdmin() && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={S.settingRow}>
                  <div>
                    <div style={S.settingLabel}>Only admins can send</div>
                    <div style={S.settingDesc}>Restrict messaging to group admins only</div>
                  </div>
                  <div style={{ ...S.toggle, background: onlyAdminsCanSend ? "#3b82f6" : "#cbd5e1" }}
                    onClick={() => toggleGroupSetting("onlyAdminsCanSend", !onlyAdminsCanSend)}>
                    <div style={{ ...S.toggleKnob, transform: onlyAdminsCanSend ? "translateX(20px)" : "translateX(0)" }} />
                  </div>
                </div>
                <div style={S.settingRow}>
                  <div>
                    <div style={S.settingLabel}>Disappearing messages</div>
                    <div style={S.settingDesc}>Messages auto-delete after set days</div>
                  </div>
                  <select style={S.select}
                    value={disappearAfterDays || 0}
                    onChange={e => updateDisappearSetting(Number(e.target.value))}>
                    <option value={0}>Off</option>
                    <option value={1}>1 day</option>
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STARRED MESSAGES PANEL ── */}
      {showStarred && (
        <div style={S.overlay} onClick={() => setShowStarred(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#e9edef" }}>⭐ Starred Messages</span>
              <button style={S.closeBtn} onClick={() => setShowStarred(false)}>✕</button>
            </div>
            <div style={{ maxHeight: 400, overflowY: "auto", padding: "0 4px" }}>
              {starredMessages.length === 0 && <div style={S.emptyState}>No starred messages</div>}
              {starredMessages.map((s, i) => (
                <div key={i} style={S.starredItem}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#a5b4fc" }}>{s.senderName}</div>
                  <div style={{ fontSize: 13, color: "#e9edef", marginTop: 2 }}>{s.text}</div>
                  <div style={{ fontSize: 11, color: "#8696a0", marginTop: 4 }}>
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── READ-BY POPUP ── */}
      {readByPopup && (
        <div style={S.overlay} onClick={() => setReadByPopup(null)}>
          <div style={{ ...S.modal, maxWidth: 320 }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <span style={{ fontWeight: 700, color: "#e9edef" }}>✓✓ Read by</span>
              <button style={S.closeBtn} onClick={() => setReadByPopup(null)}>✕</button>
            </div>
            {(readByPopup.names || []).length === 0
              ? <div style={S.emptyState}>No one has read this yet</div>
              : (readByPopup.names || []).map((name, i) => <div key={i} style={{ padding: "8px 0", fontSize: 14, color: "#e9edef", borderBottom: "1px solid #2a3942" }}>{name}</div>)
            }
          </div>
        </div>
      )}

      {/* ── FORWARD MODAL ── */}
      {forwardMsg && (
        <div style={S.overlay} onClick={() => setForwardMsg(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <span style={{ fontWeight: 700, color: "#e9edef" }}>↪ Forward message</span>
              <button style={S.closeBtn} onClick={() => setForwardMsg(null)}>✕</button>
            </div>
            <div style={{ fontSize: 13, color: "#8696a0", marginBottom: 12 }}>Select a conversation to forward to:</div>
            {staffList.map(s => (
              <div key={s._id} style={S.forwardItem} onClick={() => { handleForward(s._id); setForwardMsg(null); }}>
                <div style={{ ...S.avatar, width: 34, height: 34, fontSize: 13 }}>
                  {getInitials(s.name)}
                </div>
                <span style={{ fontSize: 14, color: "#e9edef" }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MEDIA PREVIEW ── */}
      {mediaPreview && (
        <div style={S.overlay} onClick={() => setMediaPreview(null)}>
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
            <button style={{ ...S.closeBtn, position: "absolute", top: -16, right: -16, background: 'var(--bg-card, white)', borderRadius: "50%", width: 32, height: 32 }}
              onClick={() => setMediaPreview(null)}>✕</button>
            {mediaPreview.type === "image" && (
              <img src={mediaPreview.url} alt={mediaPreview.name} style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
            )}
            {mediaPreview.type === "video" && (
              <video src={mediaPreview.url} controls style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 12 }} />
            )}
          </div>
        </div>
      )}

      {/* ── SCHEDULE MESSAGE MODAL ── */}
      {showScheduleModal && (
        <div style={S.overlay} onClick={() => setShowScheduleModal(false)}>
          <div style={{ ...S.modal, maxWidth: 460, maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <span style={{ fontWeight: 700, color: "#e9edef" }}>⏱ Schedule Message</span>
              <button style={S.closeBtn} onClick={() => setShowScheduleModal(false)}>✕</button>
            </div>
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea
                placeholder="Message to schedule..."
                value={scheduleText}
                onChange={e => setScheduleText(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #3a3f4b", background: "#1e2430", color: "#e9edef", fontSize: 14, minHeight: 80, resize: "vertical", fontFamily: "inherit", outline: "none" }}
              />
              <div>
                <div style={{ fontSize: 12, color: "#8696a0", marginBottom: 6 }}>Send at:</div>
                <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #3a3f4b", background: "#1e2430", color: "#e9edef", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <button onClick={handleScheduleSubmit} disabled={!scheduleText.trim() || !scheduleAt}
                style={{ padding: "10px", background: "#6366f1", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Schedule
              </button>

              {/* Pending scheduled messages */}
              <div style={{ borderTop: "1px solid #2a3042", paddingTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#e9edef" }}>Pending ({scheduledMsgs.length})</span>
                  <button onClick={fetchScheduledMsgs} style={{ background: "none", border: "none", color: "#8696a0", cursor: "pointer", fontSize: 12 }}>↻ Refresh</button>
                </div>
                {scheduledMsgs.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#8696a0", textAlign: "center", padding: "12px 0" }}>No pending messages</div>
                ) : (
                  scheduledMsgs.map(m => (
                    <div key={m._id} style={{ background: "#1e2430", borderRadius: 8, padding: "10px 12px", marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: "#e9edef", marginBottom: 4, wordBreak: "break-word" }}>{m.text}</div>
                        <div style={{ fontSize: 11, color: "#8696a0" }}>
                          📅 {new Date(m.scheduledAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteScheduled(m._id)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>🗑️</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTEXT MENU ── */}
      {contextMenu && (
        <div style={{ ...S.ctxMenu, top: contextMenu.y, left: contextMenu.x }} onClick={e => e.stopPropagation()}>
          {!contextMenu.msg.isDeleted && (
            <>
              <div style={S.ctxItem} onClick={() => { setReplyingTo(contextMenu.msg); setContextMenu(null); }}>↩ Reply</div>
              <div style={S.ctxItem} onClick={() => { setForwardMsg(contextMenu.msg); setContextMenu(null); }}>↪ Forward</div>
              <div style={S.ctxItem} onClick={() => { handleStar(contextMenu.msg._id); setContextMenu(null); }}>
                {starredMessages.some(s => s.messageId?.toString() === contextMenu.msg._id?.toString()) ? "★ Unstar" : "☆ Star"}
              </div>
              {selectedDepartment && isGroupAdminOrAdmin() && (
                <div style={S.ctxItem} onClick={() => { handlePin(contextMenu.msg._id); setContextMenu(null); }}>
                  {pinnedMessages.some(p => p.messageId?.toString() === contextMenu.msg._id?.toString()) ? "📌 Unpin" : "📌 Pin"}
                </div>
              )}
              {contextMenu.msg.senderId?.toString() === currentUser?.id?.toString() && (
                <>
                  {/* No edit for voice notes or file-only messages */}
                  {contextMenu.msg.text && !contextMenu.msg.files?.some(f => (f.originalName || f.path || '').includes('voice-note')) && (
                    <div style={S.ctxItem} onClick={() => {
                      const newText = prompt("Edit message:", contextMenu.msg.text);
                      if (newText && newText !== contextMenu.msg.text) handleEdit(contextMenu.msg._id, newText);
                      setContextMenu(null);
                    }}>✏️ Edit</div>
                  )}
                  <div style={{ ...S.ctxItem, color: "#ef4444" }} onClick={() => { handleDelete(contextMenu.msg._id); setContextMenu(null); }}>🗑️ Delete</div>
                </>
              )}
            </>
          )}
          {/* Emoji reaction picker */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 6, marginTop: 4 }}>
            <div style={{ fontSize: 11, color: 'var(--text-lighter, #94a3b8)', padding: "0 12px 4px" }}>React</div>
            <div style={{ display: "flex", gap: 6, padding: "0 12px 8px", flexWrap: "wrap" }}>
              {["👍", "❤️", "😂", "😮", "😢", "🔥"].map(em => (
                <span key={em} style={{ fontSize: 20, cursor: "pointer" }}
                  onClick={() => { handleReact(contextMenu.msg._id, em); setContextMenu(null); }}>
                  {em}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INCOMING CALL ── */}
      {incomingCall && (
        <div style={S.callOverlay}>
          <div style={S.callModal}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{incomingCall.callType === "video" ? "📹" : "📞"}</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#e9edef", marginBottom: 4 }}>
              Incoming {incomingCall.callType} call
            </div>
            <div style={{ fontSize: 14, color: "#8696a0", marginBottom: 24 }}>{incomingCall.callerName}</div>
            <div style={{ display: "flex", gap: 16 }}>
              <button style={{ ...S.callBtn, background: "#22c55e" }} onClick={acceptCall}>Accept</button>
              <button style={{ ...S.callBtn, background: "#ef4444" }} onClick={declineCall}>Decline</button>
            </div>
          </div>
        </div>
      )}

      {/* ── OUTGOING CALL ── */}
      {activeCall && !jitsiRoom && (
        <div style={S.callOverlay}>
          <div style={S.callModal}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{activeCall.callType === "video" ? "📹" : "📞"}</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#e9edef", marginBottom: 4 }}>
              Calling...
            </div>
            <div style={{ fontSize: 14, color: "#8696a0", marginBottom: 24 }}>
              {activeCall.receiverName || ""}
            </div>
            <button style={{ ...S.callBtn, background: "#ef4444" }} onClick={endCall}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── JITSI CALL WINDOW ── */}
      {jitsiRoom && (
        <div style={S.jitsiOverlay}>
          <div style={S.jitsiContainer}>
            <div id="jitsi-container" style={{ width: "100%", height: "100%" }} />
            <button style={S.jitsiEndBtn} onClick={endCall}>End Call</button>
          </div>
        </div>
      )}

      {/* ── MISSED CALL TOAST ── */}
      {missedCallToast && (
        <div style={S.toast}>
          📵 Missed {missedCallToast.callType} call from {missedCallToast.callerName}
        </div>
      )}
    </div>
  );
}

// ── Gray/slate theme ─────────────────────────────────────────────────────────
const WA_SIDEBAR_BG   = "#1e1e2e";   // dark sidebar
const WA_SIDEBAR_HDR  = "#2a2a3e";   // slightly lighter header
const WA_SIDEBAR_ITEM = "#1e1e2e";
const WA_SIDEBAR_ACT  = "#35354f";   // active/hover item
const WA_CHAT_BG      = "#16161f";   // chat background
const WA_CHAT_TILE    = "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e1e2e' fill-opacity='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";
const WA_BUBBLE_OUT   = "#3a3a5c";   // sent bubble (slate-purple)
const WA_BUBBLE_IN    = "#2a2a3e";   // received bubble (dark slate)
const WA_TEXT         = "#e2e2f0";   // primary text
const WA_TEXT_SUB     = "#8888aa";   // secondary text
const WA_HEADER_BG    = "#2a2a3e";
const WA_INPUT_BG     = "#35354f";
const WA_DIVIDER      = "#35354f";
const WA_GREEN        = "#9090c0";   // accent (slate-blue, replaces green)

const S = {
  root: { display: "flex", height: "100vh", background: WA_CHAT_BG, fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif", overflow: "hidden", position: "relative" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: WA_CHAT_BG },
  spinner: { width: 40, height: 40, border: `4px solid ${WA_DIVIDER}`, borderTop: `4px solid ${WA_GREEN}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  // ── Sidebar ──
  sidebar: { width: 360, minWidth: 300, background: WA_SIDEBAR_BG, borderRight: `1px solid ${WA_DIVIDER}`, display: "flex", flexDirection: "column", flexShrink: 0 },
  sidebarHeader: { background: WA_SIDEBAR_HDR, padding: "10px 16px 8px", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 },
  sidebarTitle: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  searchInput: { width: "100%", padding: "8px 14px 8px 36px", borderRadius: 8, border: "none", fontSize: 14, outline: "none", background: WA_INPUT_BG, color: WA_TEXT, boxSizing: "border-box" },
  searchWrap: { position: "relative" },
  searchIcon: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: WA_TEXT_SUB, fontSize: 14, pointerEvents: "none" },
  sidebarList: { flex: 1, overflowY: "auto" },
  sidebarItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", borderBottom: `1px solid ${WA_DIVIDER}`, background: WA_SIDEBAR_ITEM },
  sidebarItemActive: { background: WA_SIDEBAR_ACT },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 8px", cursor: "pointer", background: WA_SIDEBAR_HDR, borderBottom: `1px solid ${WA_DIVIDER}` },
  sidebarItemInfo: { flex: 1, minWidth: 0 },
  sidebarItemName: { fontSize: 15, fontWeight: 500, color: WA_TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  sidebarItemSub: { fontSize: 13, color: WA_TEXT_SUB, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 },
  badge: { background: "#6366f1", color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "2px 7px", flexShrink: 0, minWidth: 20, textAlign: "center" },
  avatarWrap: { position: "relative", flexShrink: 0 },
  onlineDot: { position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", border: `2px solid ${WA_SIDEBAR_BG}` },

  // ── Avatar ──
  avatar: { width: 46, height: 46, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600, fontSize: 16, flexShrink: 0, background: "#6b7280" },

  // ── Main area ──
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: WA_CHAT_BG },
  welcome: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: WA_CHAT_BG },

  // ── Chat header ──
  chatHeader: { display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: WA_HEADER_BG, borderBottom: `1px solid ${WA_DIVIDER}`, flexShrink: 0, minHeight: 60 },
  backBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: WA_TEXT_SUB, padding: "0 8px 0 0" },
  chatHeaderInfo: { display: "flex", alignItems: "center", gap: 12, flex: 1, cursor: "pointer" },
  chatHeaderActions: { display: "flex", alignItems: "center", gap: 2 },
  headerBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: "8px", borderRadius: "50%", color: WA_TEXT_SUB, transition: "background 0.15s" },

  // ── Status menu ──
  statusMenu: { position: "absolute", top: 44, right: 0, background: "#233138", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", padding: "6px 0", zIndex: 300, minWidth: 210 },
  statusMenuTitle: { padding: "6px 16px 8px", fontSize: 11, fontWeight: 700, color: WA_TEXT_SUB, textTransform: "uppercase", letterSpacing: "0.5px" },
  statusOption: { display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", fontSize: 14, color: WA_TEXT },
  statusCustomInput: { width: "calc(100% - 32px)", margin: "4px 16px 8px", padding: "8px 12px", borderRadius: 8, border: "none", background: WA_INPUT_BG, color: WA_TEXT, fontSize: 13, outline: "none" },

  // ── Drop menus ──
  dropMenu: { position: "absolute", top: 44, right: 0, background: "#233138", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", padding: "6px 0", zIndex: 300, minWidth: 190 },
  dropItem: { padding: "10px 18px", fontSize: 14, color: WA_TEXT, cursor: "pointer" },

  // ── Chat background ──
  chatBg: { flex: 1, overflowY: "auto", backgroundImage: WA_CHAT_TILE, backgroundSize: "auto", display: "flex", flexDirection: "column" },

  // ── Pinned banner ──
  pinnedBanner: { display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", background: "linear-gradient(90deg,#1e1b4b,#2d2060)", borderBottom: `2px solid #6366f1`, flexShrink: 0, cursor: "pointer", borderLeft: "3px solid #a78bfa" },
  typingBar: { padding: "2px 16px 4px", fontSize: 13, color: "#a5b4fc", fontStyle: "italic", background: "transparent", flexShrink: 0 },

  // ── Messages ──
  messagesList: { flex: 1, overflowY: "auto", padding: "12px 8%", display: "flex", flexDirection: "column", gap: 2, backgroundImage: WA_CHAT_TILE },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 2 },
  msgSenderName: { fontSize: 12, fontWeight: 700, color: "#a5b4fc", marginBottom: 2 },
  forwardedLabel: { fontSize: 11, color: WA_TEXT_SUB, fontStyle: "italic", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 },
  replyPreview: { background: "rgba(0,0,0,0.25)", borderLeft: "3px solid #6366f1", borderRadius: "0 4px 4px 0", padding: "4px 8px", marginBottom: 4, maxWidth: "100%" },
  bubble: { padding: "7px 12px 6px", borderRadius: 8, maxWidth: "100%", wordBreak: "break-word", lineHeight: 1.5, cursor: "pointer", position: "relative", boxShadow: "0 1px 2px rgba(0,0,0,0.3)" },
  bubbleOwn: { background: WA_BUBBLE_OUT, color: WA_TEXT, borderTopRightRadius: 0 },
  bubbleOther: { background: WA_BUBBLE_IN, color: WA_TEXT, borderTopLeftRadius: 0 },
  bubbleMissed: { background: "#1a1a2e", border: `1px solid #4a1942`, color: "#f87171" },
  msgText: { fontSize: 14, lineHeight: 1.5, color: WA_TEXT },
  mediaImg: { maxWidth: 260, maxHeight: 220, borderRadius: 6, marginTop: 4, cursor: "pointer", display: "block" },
  fileLink: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "rgba(0,0,0,0.2)", borderRadius: 6, fontSize: 13, color: WA_TEXT, textDecoration: "none", marginTop: 4 },
  msgMeta: { display: "flex", alignItems: "center", gap: 4, marginTop: 3, justifyContent: "flex-end" },
  msgTime: { fontSize: 11, color: WA_TEXT_SUB },
  reactionsRow: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 },
  reactionChip: { background: "rgba(0,0,0,0.3)", border: `1px solid ${WA_DIVIDER}`, borderRadius: 12, padding: "2px 8px", fontSize: 13, cursor: "pointer", color: WA_TEXT },

  // ── Reply bar ──
  replyBar: { display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", background: "#182229", borderTop: `1px solid ${WA_DIVIDER}`, flexShrink: 0 },
  replyBarClose: { background: "none", border: "none", cursor: "pointer", color: WA_TEXT_SUB, fontSize: 18, padding: 4 },

  // ── Mention box ──
  mentionBox: { position: "absolute", bottom: 72, left: 16, background: "#233138", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", zIndex: 100, minWidth: 200, overflow: "hidden" },
  mentionItem: { padding: "10px 16px", fontSize: 14, color: WA_TEXT, cursor: "pointer", borderBottom: `1px solid ${WA_DIVIDER}` },

  // ── Input bar ──
  inputBar: { display: "flex", alignItems: "flex-end", gap: 8, padding: "8px 16px", background: WA_HEADER_BG, flexShrink: 0, position: "relative" },
  inputBtn: { background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: "6px", borderRadius: "50%", color: WA_TEXT_SUB, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  textInput: { flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", fontSize: 15, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 120, overflowY: "auto", background: WA_INPUT_BG, color: WA_TEXT },
  sendBtn: { background: "#6366f1", color: "#fff", border: "none", borderRadius: "50%", width: 44, height: 44, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  attachedPreview: { display: "flex", flexWrap: "wrap", gap: 6, padding: "0 0 6px" },
  attachedChip: { display: "flex", alignItems: "center", gap: 4, background: WA_INPUT_BG, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: WA_TEXT },
  attachedRemove: { background: "none", border: "none", cursor: "pointer", color: WA_TEXT_SUB, fontSize: 14, padding: 0 },

  // ── Group info panel ──
  groupPanel: { width: 360, background: WA_SIDEBAR_BG, borderLeft: `1px solid ${WA_DIVIDER}`, display: "flex", flexDirection: "column", flexShrink: 0 },
  groupPanelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: WA_HEADER_BG, borderBottom: `1px solid ${WA_DIVIDER}` },
  groupPanelBody: { flex: 1, overflowY: "auto", padding: "12px 16px" },
  tabRow: { display: "flex", background: WA_HEADER_BG, borderBottom: `1px solid ${WA_DIVIDER}` },
  tabBtn: { flex: 1, padding: "12px 4px", background: "none", border: "none", fontSize: 12, cursor: "pointer", color: WA_TEXT_SUB, fontWeight: 600, borderBottom: "2px solid transparent" },
  tabBtnActive: { color: "#a5b4fc", borderBottom: "2px solid #6366f1" },
  memberRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${WA_DIVIDER}` },
  smallBtn: { padding: "4px 10px", background: "transparent", color: "#a5b4fc", border: "1px solid #6366f1", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" },
  mediaGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 },
  mediaThumb: { width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 4, cursor: "pointer" },
  emptyState: { textAlign: "center", color: WA_TEXT_SUB, fontSize: 13, padding: "24px 0" },
  settingRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: `1px solid ${WA_DIVIDER}` },
  settingLabel: { fontSize: 14, fontWeight: 500, color: WA_TEXT },
  settingDesc: { fontSize: 12, color: WA_TEXT_SUB, marginTop: 2 },
  toggle: { width: 46, height: 26, borderRadius: 13, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 },
  toggleKnob: { position: "absolute", top: 3, left: 3, width: 20, height: 20, borderRadius: "50%", background: 'var(--bg-card, white)', transition: "transform 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" },
  select: { padding: "6px 10px", borderRadius: 6, border: `1px solid ${WA_DIVIDER}`, fontSize: 13, outline: "none", background: WA_INPUT_BG, color: WA_TEXT },

  // ── Modals / overlays ──
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 },
  modal: { background: "#233138", borderRadius: 12, padding: "20px 24px", minWidth: 340, maxWidth: 480, width: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  closeBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: WA_TEXT_SUB, padding: 4 },
  starredItem: { padding: "10px 0", borderBottom: `1px solid ${WA_DIVIDER}` },
  forwardItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", cursor: "pointer", borderBottom: `1px solid ${WA_DIVIDER}` },

  // ── Context menu ──
  ctxMenu: { position: "fixed", background: "#233138", borderRadius: 8, boxShadow: "0 4px 24px rgba(0,0,0,0.5)", zIndex: 400, minWidth: 190, overflow: "hidden" },
  ctxItem: { padding: "11px 18px", fontSize: 14, color: WA_TEXT, cursor: "pointer" },

  // ── Call UI ──
  callOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 },
  callModal: { background: "#182229", borderRadius: 20, padding: "36px 48px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" },
  callBtn: { padding: "13px 30px", color: "white", border: "none", borderRadius: 50, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  jitsiOverlay: { position: "fixed", inset: 0, background: "#000", zIndex: 700, display: "flex", flexDirection: "column" },
  jitsiContainer: { flex: 1, position: "relative" },
  jitsiEndBtn: { position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", padding: "12px 32px", background: "#ef4444", color: "white", border: "none", borderRadius: 50, fontSize: 15, fontWeight: 700, cursor: "pointer", zIndex: 10 },

  // ── Toast ──
  toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#182229", color: WA_TEXT, padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, zIndex: 800, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", border: `1px solid ${WA_DIVIDER}` },
};

export default ChatBox;
=======
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
>>>>>>> 500de3921b8b68c26e46441c078fdc0e74f56b00
