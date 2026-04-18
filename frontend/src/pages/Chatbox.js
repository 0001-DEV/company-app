import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import PollWidget from "../components/PollWidget";

const EMOJI_CATEGORIES = [
  { label: "😀", name: "Smileys", emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"] },
  { label: "❤️", name: "Hearts & Love", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","💌","💋","👋","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏"] },
  { label: "🎉", name: "Celebration", emojis: ["🎉","🎊","🎈","🎁","🎀","🎂","🍰","🧁","🍾","🍷","🍸","🍹","🍺","🍻","🥂","🥃","🍽️","🍴","🥄","🔪","🥢","🧂","🍳","🍲","🥘","🍱","🍛","🍜","🍝","🍠","🍢","🍣","🍤","🍥","🥟","🥠","🥮","🍙","🍚","🍘","🍗","🍖","🌭","🍔","🍟","🍕","🥪","🥙","🧆","🌮","🌯","🥗","🥘","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡","🍧","🍨","🍦","🍰","🎂","🧁","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯"] },
  { label: "🐶", name: "Animals", emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🐢","🐍","🦎","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅","🐆","🦓","🦍","🦧","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦌","🦙","🐐","🐕","🐩","🦮","🐈","🐓","🦃","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦦","🦥","🐁","🐀","🐿️","🦔"] },
  { label: "🌍", name: "Nature", emojis: ["🌍","🌎","🌏","🌐","🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘","🌙","🌚","🌝","🌛","🌜","⭐","🌟","✨","⚡","☄️","💥","🔥","🌪️","🌈","☀️","🌤️","⛅","🌥️","☁️","🌦️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","🌬️","💨","💧","💦","☔"] },
  { label: "⚽", name: "Sports", emojis: ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎳","🏓","🏸","🏒","🏑","🥍","🏏","🥅","⛳","⛸️","🎣","🎽","🎿","⛷️","🏂","🪂","🏋️","🤼","🤸","⛹️","🏌️","🏇","🧘","🏄","🏊","🤽","🚣","🧗","🚴","🚵","🎯","🪀","🪃","🎪","🎨","🎬","🎤","🎧","🎼","🎹","🥁","🎷","🎺","🎸","🪕","🎻","🎲","♟️","🎮","🎰","🧩"] },
  { label: "🚗", name: "Travel", emojis: ["🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍️","🛵","🦯","🦽","🦼","🛺","🚲","🛴","🛹","🛼","🚏","⛽","🚨","🚥","🚦","🛑","🚧","⚓","⛵","🛶","🚤","🛳️","⛴️","🛥️","🚢","🚀","🛸","✈️","🛩️","🛫","🛬","🛰️","🚁","🌍","🌎","🌏","💺","🧳"] },
  { label: "💡", name: "Objects", emojis: ["💡","🔦","🕯️","🪔","🧯","🛢️","💸","💵","💴","💶","💷","💰","💳","🧾","✉️","📩","📨","📤","📥","📦","🏷️","📪","📫","📬","📭","📮","📯","📜","📃","📄","📑","🗂️","🗃️","🗳️","🗄️","📋","📁","📂","🗞️","📰","📓","📔","📒","📕","📗","📘","📙","📚","📖","🧷","🔖","🔗","📎","🖇️","📐","📏","🧮","📌","📍","✂️","🖊️","🖋️","✒️","🖌️","🖍️","📝"] },
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
    <div ref={ref} style={EP.wrap} onMouseDown={e => e.stopPropagation()}>
      <div style={EP.searchRow}>
        <input autoFocus placeholder="Search emoji..." value={search} onChange={e => setSearch(e.target.value)} style={EP.searchInput} onMouseDown={e => e.stopPropagation()} />
      </div>
      <div style={EP.catRow}>
        {EMOJI_CATEGORIES.map((c, i) => (
          <button key={i} title={c.name} style={{ ...EP.catBtn, ...(activeCategory === i && !search ? EP.catBtnActive : {}) }}
            onClick={() => { setActiveCategory(i); setSearch(""); }} onMouseDown={e => e.stopPropagation()}>{c.label}</button>
        ))}
      </div>
      {!search && <div style={EP.catName}>{EMOJI_CATEGORIES[activeCategory].name}</div>}
      <div style={EP.grid}>
        {filtered.map((emoji, i) => (
          <button key={i} style={EP.emojiBtn} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(emoji); }} onMouseDown={e => e.stopPropagation()}>{emoji}</button>
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

const AudioPlayer = ({ fileUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (!audioRef.current) {
      audioRef.current = new Audio(fileUrl);
      audioRef.current.onended = () => { setIsPlaying(false); };
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  return (
    <button onClick={handlePlayPause} style={{ background: "none", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, color: "#fff", padding: 0, flexShrink: 0 }}>
      {isPlaying ? "⏸️" : "▶️"}
    </button>
  );
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
  const [unreadCounts, setUnreadCounts] = useState({});
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingNames, setTypingNames] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [forwardMsg, setForwardMsg] = useState(null);
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
  const [onlyAdminsCanSend, setOnlyAdminsCanSend] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
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
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionCandidates, setMentionCandidates] = useState([]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState(null);
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
  const voiceRecorderRef = useRef(null);
  const voiceChunksRef = useRef([]);
  const voiceTimerRef = useRef(null);
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

  useEffect(() => {
    if (!currentUser) return;
    const beat = async () => { try { const token = localStorage.getItem("token"); await fetch("/api/chat/heartbeat", { method: "POST", headers: { Authorization: `Bearer ${token}` } }); } catch (_) {} };
    beat(); const iv = setInterval(beat, 20000); return () => clearInterval(iv);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || staffList.length === 0) return;
    const fetchOnline = async () => {
      try {
        const token = localStorage.getItem("token");
        const ids = staffList.map(s => s._id).join(",");
        const res = await fetch(`/api/chat/online-status?ids=${ids}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setOnlineStatus(await res.json());
      } catch (_) {}
    };
    fetchOnline(); const iv = setInterval(fetchOnline, 15000); return () => clearInterval(iv);
  }, [currentUser, staffList]);

  useEffect(() => {
    if (!currentUser || staffList.length === 0) return;
    const fetchStatuses = async () => {
      try {
        const token = localStorage.getItem("token");
        const ids = staffList.map(s => s._id).join(",");
        const res = await fetch(`/api/features/status?ids=${ids}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setPeerStatuses(await res.json());
      } catch (_) {}
    };
    fetchStatuses(); const iv = setInterval(fetchStatuses, 15000); return () => clearInterval(iv);
  }, [currentUser, staffList]);

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
        const res = await fetch(`/api/chat/typing?conversationKey=${getConvKey()}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setTypingNames(await res.json());
      } catch (_) {}
    };
    const iv = setInterval(fetchTyping, 2000); return () => clearInterval(iv);
  }, [currentUser, viewMode, selectedUser, selectedDepartment]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { setError("Please log in first to use chat"); setLoading(false); return; }
        const response = await fetch("/api/chat/me", { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) { setCurrentUser(await response.json()); }
        else { const d = await response.json(); setError(`Authentication failed: ${d.message || "Unknown error"}`); }
      } catch (err) { setError(`Error connecting to server: ${err.message}`); }
      finally { setLoading(false); }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchStaffList = async () => {
      setStaffLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/chat/users", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setStaffList(await res.json());
      } catch (err) { console.error(err); } finally { setStaffLoading(false); }
    };
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/departments", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setDepartments(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchStaffList(); fetchDepartments();
  }, [currentUser]);

  useEffect(() => {
    if (!staffList.length) return;
    const params = new URLSearchParams(location.search);
    const dmId = params.get('dm');
    if (dmId) { setSelectedUser(dmId); setViewMode('private'); }
  }, [location.search, staffList]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/chat/unread-counts", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setUnreadCounts(await res.json());
      } catch (err) {}
    };
    fetchUnread(); const iv = setInterval(fetchUnread, 5000); return () => clearInterval(iv);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchLast = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/chat/last-messages", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setLastMessages(await res.json());
      } catch (err) {}
    };
    fetchLast(); const iv = setInterval(fetchLast, 5000); return () => clearInterval(iv);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || viewMode === "none") return;
    const loadMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        let url = "/api/chat/messages";
        if (viewMode === "private" && selectedUser) url += `?userId=${selectedUser}`;
        else if (viewMode === "department" && selectedDepartment) url += `?departmentId=${selectedDepartment._id}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setMessages(await res.json());
      } catch (err) {}
    };
    loadMessages(); const iv = setInterval(loadMessages, 3000); return () => clearInterval(iv);
  }, [currentUser, selectedUser, viewMode, selectedDepartment]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchStarred = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/chat/starred", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setStarredMessages(await res.json());
      } catch (_) {}
    };
    fetchStarred();
  }, [currentUser]);

  useEffect(() => {
    if (viewMode !== "department" || !selectedDepartment) { setPinnedMessages([]); return; }
    const fetchPins = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/chat/pins?departmentId=${selectedDepartment._id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setPinnedMessages(await res.json());
      } catch (_) {}
    };
    fetchPins(); const iv = setInterval(fetchPins, 10000); return () => clearInterval(iv);
  }, [viewMode, selectedDepartment]);

  useEffect(() => {
    if (!showGroupInfo || !selectedDepartment || groupInfoTab !== "media") return;
    const fetchMedia = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/chat/media?departmentId=${selectedDepartment._id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setMediaMessages(await res.json());
      } catch (_) {}
    };
    fetchMedia();
  }, [showGroupInfo, selectedDepartment, groupInfoTab]);

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
  }, [messages, currentUser]);

  useEffect(() => {
    const close = () => { if (contextMenu) setContextMenu(null); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [contextMenu]);

  useEffect(() => {
    const close = () => { setShowMuteMenu(false); setShowAutoDownloadMenu(false); setShowStatusMenu(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const poll = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/chat/call/incoming", { headers: { Authorization: `Bearer ${token}` } });
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
        }
      } catch (_) {}
    };
    const iv = setInterval(poll, 2000);
    return () => clearInterval(iv);
  }, [currentUser]);

  useEffect(() => {
    if (!activeCall) return;
    const poll = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/chat/call/status/${activeCall.callId}`, { headers: { Authorization: `Bearer ${token}` } });
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

  const isImageFile = (name) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name);
  const isVideoFile = (name) => /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(name);
  const isAudioFile = (name) => /\.(mp3|wav|ogg|m4a|webm|aac)$/i.test(name);
  const getInitials = (name) => (name || "?").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  const isChatMuted = (key) => { const m = mutedChats[key]; if (!m) return false; if (m === true) return true; return new Date(m) > new Date(); };

  const markAsRead = async (userId, opts = {}) => {
    try {
      const token = localStorage.getItem("token");
      const body = userId ? { userId } : opts;
      await fetch("/api/chat/messages/mark-read", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const res = await fetch("/api/chat/unread-counts", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUnreadCounts(await res.json());
    } catch (_) {}
  };

  const saveStatus = async (status, emoji) => {
    const newStatus = { status, emoji };
    setMyStatus(newStatus);
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/features/status", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newStatus)
      });
    } catch (_) {}
  };

  const reloadMessages = async () => {
    const token = localStorage.getItem("token");
    let url = "/api/chat/messages";
    if (viewMode === "private" && selectedUser) url += `?userId=${selectedUser}`;
    else if (viewMode === "department" && selectedDepartment) url += `?departmentId=${selectedDepartment._id}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setMessages(await res.json());
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
      const res = await fetch("/api/chat/message", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (res.ok) { setText(""); setSelectedFiles([]); setReplyingTo(null); reloadMessages(); }
    } catch (_) {}
  };

  const notifyTyping = async (isTyping) => {
    try {
      const token = localStorage.getItem("token");
      let convKey = "all";
      if (viewMode === "private" && selectedUser) convKey = `private:${[currentUser.id, selectedUser].sort().join(":")}`;
      else if (viewMode === "department" && selectedDepartment) convKey = `dept:${selectedDepartment._id}`;
      await fetch("/api/chat/typing", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversationKey: convKey, isTyping })
      });
    } catch (_) {}
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    notifyTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => notifyTyping(false), 3000);
  };

  const startRing = (incoming = false) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ringAudioRef.current = ctx;
      
      // Create a more realistic ringtone pattern
      const playRingPattern = () => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        // Two tones for a more realistic ringtone
        osc1.frequency.setValueAtTime(800, ctx.currentTime);
        osc2.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        
        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.4);
        osc2.stop(ctx.currentTime + 0.4);
      };
      
      playRingPattern();
      const iv = setInterval(playRingPattern, 1200);
      ctx._ringInterval = iv;
    } catch (_) {}
  };

  const stopRing = () => {
    if (ringAudioRef.current) {
      if (ringAudioRef.current._ringInterval) clearInterval(ringAudioRef.current._ringInterval);
      try {
        ringAudioRef.current.close();
      } catch (_) {}
      ringAudioRef.current = null;
    }
  };

  const startCall = async (type) => {
    if (!selectedUser && viewMode !== "department") return;
    let roomName, receiverId, receiverName;
    if (viewMode === "private" && selectedUser) {
      const peer = staffList.find(s => s._id === selectedUser);
      roomName = `xtreme-${type}-${[currentUser.id, selectedUser].sort().join("-")}`;
      receiverId = selectedUser;
      receiverName = peer?.name || selectedUser;
    } else if (viewMode === "department" && selectedDepartment) {
      roomName = `xtreme-${type}-dept-${selectedDepartment._id}`;
      receiverId = selectedDepartment._id;
      receiverName = selectedDepartment.name;
    } else return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/chat/call/initiate", {
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
        await fetch("/api/chat/call/end", {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ callId: activeCall.callId })
        });
      } catch (_) {}
      setActiveCall(null);
    }
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      } catch (_) {}
    }
    setJitsiRoom(null);
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    stopRing();
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/chat/call/respond", {
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
      await fetch("/api/chat/call/respond", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ callId: incomingCall.callId, action: "decline" })
      });
    } catch (_) {}
    setIncomingCall(null);
  };

  const handleReact = async (msgId, emoji) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/chat/messages/${msgId}/react`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emoji })
      });
      reloadMessages();
    } catch (_) {}
  };

  const handlePin = async (msgId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/chat/messages/${msgId}/pin`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` }
      });
      reloadMessages();
    } catch (_) {}
  };

  const handleStar = async (msgId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/chat/messages/${msgId}/star`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { const d = await res.json(); setStarredMessages(d.starredMessages); }
    } catch (_) {}
  };

  const handleReadBy = async (msgId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/chat/messages/${msgId}/read-by`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setReadByPopup({ msgId, names: d.names }); }
    } catch (_) {}
  };

  const handleDelete = async (msgId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/chat/messages/${msgId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      reloadMessages();
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
      await fetch("/api/chat/message", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData
      });
      setForwardMsg(null);
    } catch (_) {}
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      voiceRecorderRef.current = recorder;
      voiceChunksRef.current = [];
      recorder.ondataavailable = e => voiceChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(voiceChunksRef.current, { type: "audio/webm" });
        setVoiceBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setVoiceRecording(true);
      setVoiceDuration(0);
      voiceTimerRef.current = setInterval(() => setVoiceDuration(t => t + 1), 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopVoiceRecording = () => {
    if (voiceRecorderRef.current) {
      voiceRecorderRef.current.stop();
      setVoiceRecording(false);
      clearInterval(voiceTimerRef.current);
    }
  };

  const sendVoiceNote = async () => {
    if (!voiceBlob) return;
    try {
      const file = new File([voiceBlob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
      file.duration = voiceDuration;
      setSelectedFiles(prev => [...prev, file]);
      setVoiceBlob(null);
      setVoiceDuration(0);
      setShowVoiceModal(false);
      await sendMessage();
    } catch (err) {
      console.error("Error sending voice note:", err);
    }
  };

  const discardVoiceNote = () => {
    setVoiceBlob(null);
    setVoiceDuration(0);
    setVoiceRecording(false);
    clearInterval(voiceTimerRef.current);
    setShowVoiceModal(false);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadGroupInfo = async (dept) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/department-members/${dept._id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        setGroupMembers(d.members || []);
        setGroupAdmins(d.groupAdmins || []);
        setOnlyAdminsCanSend(d.onlyAdminsCanSend || false);
        setDisappearAfterDays(d.disappearAfterDays || 0);
      } else {
        console.error("Failed to load group info:", res.status);
        setGroupMembers([]);
        setGroupAdmins([]);
      }
    } catch (err) {
      console.error("Error loading group info:", err);
      setGroupMembers([]);
      setGroupAdmins([]);
    }
  };

  const muteChat = (key, duration) => {
    if (duration === 0) setMutedChats(prev => { const n = { ...prev }; delete n[key]; return n; });
    else if (duration === -1) setMutedChats(prev => ({ ...prev, [key]: true }));
    else setMutedChats(prev => ({ ...prev, [key]: new Date(Date.now() + duration * 3600000).toISOString() }));
    setShowMuteMenu(false);
  };

  const filteredStaff = staffList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDepts = departments.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div style={S.center}><div style={S.spinner} /></div>;
  if (error) return <div style={S.center}><div style={{ color: "#ef4444" }}>{error}</div></div>;

  return (
    <div style={S.root}>
      <style>{`
        @media (max-width: 768px) {
          .chatbox-root {
            flex-direction: column;
          }
          .chatbox-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #2a3f4b;
            max-height: 40vh;
            min-height: auto;
          }
          .chatbox-main {
            flex: 1;
            min-height: 60vh;
          }
          .chatbox-sidebar-list {
            max-height: calc(40vh - 120px);
          }
          .chatbox-messages {
            padding: 12px;
            gap: 6px;
          }
          .chatbox-bubble {
            max-width: 85%;
            padding: 6px 10px;
          }
          .chatbox-input-bar {
            flex-wrap: wrap;
            gap: 8px;
          }
          .chatbox-text-input {
            min-height: 32px;
            font-size: 12px;
          }
          .chatbox-modal {
            width: 90% !important;
            max-width: 90vw !important;
          }
          .chatbox-sidebar-panel {
            width: 100% !important;
            max-width: 100vw !important;
            height: 50vh !important;
            right: 0 !important;
            bottom: 0 !important;
            top: auto !important;
            border-left: none !important;
            border-top: 1px solid #35354f !important;
          }
        }
        
        @media (max-width: 480px) {
          .chatbox-bubble {
            max-width: 90%;
          }
          .chatbox-header-actions {
            gap: 4px;
          }
          .chatbox-header-btn {
            font-size: 14px;
            padding: 4px;
          }
          .chatbox-action-btn {
            font-size: 14px;
            padding: 4px;
          }
          .chatbox-send-btn {
            width: 32px;
            height: 32px;
            font-size: 12px;
          }
        }
      `}</style>
      {/* ── SIDEBAR ── */}
      <div style={{ ...S.sidebar, display: isMobile && viewMode !== "none" ? "none" : "flex" }} className="chatbox-sidebar">
        <div style={S.sidebarHeader}>
          <div style={S.sidebarTitle}>
            <span style={S.sidebarTitleText}>Chats</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.headerBtn, fontSize: 18 }}>⋯</button>
            </div>
          </div>
          <div style={S.searchWrap}>
            <span style={S.searchIcon}>🔍</span>
            <input placeholder="Search chats..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={S.searchInput} />
          </div>
        </div>
        <div style={S.sidebarList} className="chatbox-sidebar-list">
          {currentUser?.role === "admin" && (
            <div style={{ ...S.sidebarItem, ...(viewMode === "all" ? S.sidebarItemActive : {}) }}
              onClick={() => { setViewMode("all"); setSelectedUser(null); setSelectedDepartment(null); markAsRead(null, { teamChat: true }); }}>
              <div style={{ ...S.avatar, background: "linear-gradient(135deg, #f59e0b, #d97706)", width: 44, height: 44, fontSize: 20 }}>🏢</div>
              <div style={S.sidebarItemInfo}>
                <div style={S.sidebarItemName}>Team Chat</div>
                <div style={S.sidebarItemPreview}>{typeof lastMessages["all"] === "string" ? lastMessages["all"].substring(0, 40) : "No messages yet"}</div>
              </div>
              {unreadCounts["all"] > 0 && <div style={S.badge}>{unreadCounts["all"]}</div>}
            </div>
          )}
          <div style={S.sectionHeader} onClick={() => { 
            if (!deptSectionOpen) {
              const token = localStorage.getItem("token");
              fetch("/api/admin/departments", { headers: { Authorization: `Bearer ${token}` } })
                .then(res => res.ok && res.json())
                .then(data => data && setDepartments(data))
                .catch(err => console.error(err));
            }
            setDeptSectionOpen(v => !v);
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#8696a0" }}>Departments</span>
          </div>
          {deptSectionOpen && filteredDepts.map(dept => (
            <div key={dept._id} style={{ ...S.sidebarItem, ...(selectedDepartment?._id === dept._id ? S.sidebarItemActive : {}) }}
              onClick={() => { setViewMode("department"); setSelectedDepartment(dept); setSelectedUser(null); loadGroupInfo(dept); markAsRead(null, { departmentId: dept._id }); }}>
              <div style={{ ...S.avatar, background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", width: 44, height: 44, fontSize: 16 }}>{getInitials(dept.name)}</div>
              <div style={S.sidebarItemInfo}>
                <div style={S.sidebarItemName}>{dept.name}</div>
                <div style={S.sidebarItemPreview}>{typeof lastMessages[`department:${dept._id}`] === "string" ? lastMessages[`department:${dept._id}`].substring(0, 40) : "No messages yet"}</div>
              </div>
              {(unreadCounts[`department:${dept._id}`] || 0) > 0 && <div style={S.badge}>{unreadCounts[`department:${dept._id}`]}</div>}
            </div>
          ))}
          <div style={S.sectionHeader} onClick={() => setDmSectionOpen(v => !v)}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#8696a0" }}>Direct Messages</span>
          </div>
          {dmSectionOpen && filteredStaff.map(staff => (
            <div key={staff._id} style={{ ...S.sidebarItem, ...(selectedUser === staff._id ? S.sidebarItemActive : {}) }}
              onClick={() => { setViewMode("private"); setSelectedUser(staff._id); setSelectedDepartment(null); markAsRead(staff._id); }}>
              <div style={S.avatarWrap}>
                <div style={{ ...S.avatar, background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", width: 44, height: 44, fontSize: 16 }}>{getInitials(staff.name)}</div>
                <div style={{ ...S.onlineDot, background: onlineStatus[staff._id]?.online ? "#31a24c" : "#64748b" }} />
              </div>
              <div style={S.sidebarItemInfo}>
                <div style={S.sidebarItemName}>{staff.name}</div>
                <div style={S.sidebarItemPreview}>{typeof lastMessages[staff._id] === "string" ? lastMessages[staff._id].substring(0, 40) : "No messages yet"}</div>
              </div>
              {(unreadCounts[staff._id] || 0) > 0 && <div style={S.badge}>{unreadCounts[staff._id]}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div style={{ ...S.main, display: isMobile && viewMode === "none" ? "none" : "flex" }} className="chatbox-main">
        {viewMode === "none" ? (
          <div style={S.welcome}>
            <div style={S.welcomeIcon}>💬</div>
            <div style={S.welcomeText}>Select a chat to start messaging</div>
            <div style={S.welcomeSub}>Choose a contact or group from the list</div>
          </div>
        ) : (
          <>
            <div style={{ ...S.chatHeader, position: "relative" }}>
              <div style={S.chatHeaderInfo}>
                <div style={{ ...S.avatar, width: 40, height: 40, fontSize: 16 }}>
                  {selectedDepartment ? getInitials(selectedDepartment.name) : viewMode === "all" ? "🏢" : getInitials(staffList.find(s => s._id === selectedUser)?.name || "")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.chatHeaderName}>
                    {selectedDepartment ? selectedDepartment.name : viewMode === "all" ? "Team Chat" : staffList.find(s => s._id === selectedUser)?.name}
                  </div>
                  {typingNames.length > 0 && <div style={S.chatHeaderStatus}>{typingNames.join(", ")} typing...</div>}
                  {!typingNames.length && onlineStatus[selectedUser]?.online && <div style={S.chatHeaderStatus}>Online</div>}
                </div>
              </div>
              {showSearch && (
                <input type="text" placeholder="Search messages..." value={msgSearchQuery} onChange={e => setMsgSearchQuery(e.target.value)} style={{ padding: "clamp(6px, 1.5vw, 10px) clamp(10px, 2vw, 12px)", background: "#35354f", border: "1px solid #35354f", borderRadius: 6, color: "#e9edef", outline: "none", flex: 1, minWidth: 150, maxWidth: 300, fontSize: "clamp(12px, 2.5vw, 14px)" }} />
              )}
              <div style={S.chatHeaderActions} className="chatbox-header-actions">
                <button style={S.headerBtn} className="chatbox-header-btn" onClick={() => setShowSearch(!showSearch)}>🔍</button>
                <button style={S.headerBtn} className="chatbox-header-btn" onClick={() => setShowStarred(!showStarred)}>⭐</button>
                {selectedDepartment && <button style={S.headerBtn} className="chatbox-header-btn" onClick={() => { setShowGroupInfo(!showGroupInfo); if (!showGroupInfo) loadGroupInfo(selectedDepartment); }}>ℹ️</button>}
                <button style={S.headerBtn} className="chatbox-header-btn" onClick={() => setShowScheduleModal(!showScheduleModal)}>⏰</button>
                <button style={S.headerBtn} className="chatbox-header-btn" onClick={() => startCall("voice")}>📞</button>
                <button style={S.headerBtn} className="chatbox-header-btn" onClick={() => startCall("video")}>📹</button>
              </div>
            </div>
            {pinnedMessages.length > 0 && viewMode === "department" && (
              <div style={{ background: "rgba(251,146,60,0.1)", padding: "12px 16px", borderBottom: "1px solid rgba(251,146,60,0.3)", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 14 }}>📌</span>
                <div style={{ flex: 1, fontSize: 13, color: "#cbd5e1" }}>
                  {pinnedMessages.length} pinned message{pinnedMessages.length > 1 ? 's' : ''}
                </div>
                <button onClick={() => setPinnedMessages([])} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>✕</button>
              </div>
            )}
            <div style={S.messagesList} ref={messagesContainerRef} className="chatbox-messages">
              {messages.filter(msg => !msgSearchQuery || msg.text.toLowerCase().includes(msgSearchQuery.toLowerCase())).map((msg, idx) => {
                const isOwn = msg.senderId?.toString() === currentUser?.id?.toString();
                return (
                  <div key={msg._id || idx} style={{ ...S.msgRow, justifyContent: isOwn ? "flex-end" : "flex-start", position: "relative", alignItems: "flex-end", gap: 8 }}>
                    <div style={{ ...S.bubble, ...(isOwn ? S.bubbleOwn : S.bubbleOther), position: "relative", cursor: "pointer" }} onClick={e => { e.stopPropagation(); setContextMenu({ msg, type: "emoji", x: e.clientX, y: e.clientY }); }} onContextMenu={e => { e.preventDefault(); e.stopPropagation(); }}>
                      {!isOwn && <div style={S.msgSenderName}>{msg.senderName}</div>}
                      <div style={S.msgText}>{renderMentions(msg.text, currentUser?.name, staffList)}</div>
                      {msg.files && msg.files.length > 0 && (
                        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                          {msg.files.map((file, fidx) => {
                            const isAudio = isAudioFile(file.originalName || file.path);
                            const isVideo = isVideoFile(file.originalName || file.path);
                            const isImage = isImageFile(file.originalName || file.path);
                            const fileUrl = `/${file.path}`;
                            
                            return (
                              <div key={fidx} onClick={e => e.stopPropagation()}>
                                {isAudio && <AudioPlayer fileUrl={fileUrl} />}
                                {isVideo && <video controls style={{ width: "100%", maxWidth: 300, borderRadius: 6 }} src={fileUrl} />}
                                {isImage && <img src={fileUrl} alt="shared" style={{ maxWidth: 300, borderRadius: 6, cursor: "pointer" }} />}
                                {!isAudio && !isVideo && !isImage && (
                                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "underline", fontSize: 13 }}>
                                    📎 {file.originalName || file.path}
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                          {(() => {
                            const grouped = {};
                            msg.reactions.forEach(r => {
                              if (!grouped[r.emoji]) grouped[r.emoji] = 0;
                              grouped[r.emoji]++;
                            });
                            return Object.entries(grouped).map(([emoji, count]) => (
                              <button key={emoji} onClick={() => handleReact(msg._id, emoji)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "2px 8px", fontSize: 12, cursor: "pointer", color: "#cbd5e1" }}>
                                {emoji} {count}
                              </button>
                            ));
                          })()}
                        </div>
                      )}
                      <div style={S.msgMeta}>
                        <span style={S.msgTime}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {isOwn && msg.readBy && <span style={{ marginLeft: 8, fontSize: 10 }}>✓✓</span>}
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setContextMenu({ msg, type: "menu", x: e.clientX, y: e.clientY }); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18, padding: "4px 8px", borderRadius: 4, opacity: 0.6, transition: "opacity 0.2s" }} title="More options">⋮</button>
                    {contextMenu?.msg._id === msg._id && contextMenu?.type === "emoji" && (
                      <div style={{ position: "fixed", top: contextMenu.y - 50, left: contextMenu.x, background: "#2a2a3e", border: "1px solid #35354f", borderRadius: 8, zIndex: 300, boxShadow: "0 4px 12px rgba(0,0,0,0.5)", padding: "8px 10px", display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 220 }}>
                        {QUICK_REACTIONS.map(emoji => (
                          <button key={emoji} onClick={() => { handleReact(msg._id, emoji); setContextMenu(null); }} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: "3px", borderRadius: 8, lineHeight: 1 }}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                    {contextMenu?.msg._id === msg._id && contextMenu?.type === "menu" && (
                      <div style={{ position: "fixed", top: Math.max(60, contextMenu.y - 100), left: 20, background: "#2a2a3e", border: "1px solid #35354f", borderRadius: 8, zIndex: 300, boxShadow: "0 4px 12px rgba(0,0,0,0.5)", minWidth: 180 }}>
                        <button onClick={() => { handleStar(msg._id); setContextMenu(null); }} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", textAlign: "left", fontSize: 13, borderBottom: "1px solid #35354f" }}>⭐ Star Message</button>
                        {viewMode === "department" && <button onClick={() => { handlePin(msg._id); setContextMenu(null); }} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", textAlign: "left", fontSize: 13, borderBottom: "1px solid #35354f" }}>📌 Pin Message</button>}
                        <button onClick={() => { setForwardMsg(msg); setContextMenu(null); }} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", textAlign: "left", fontSize: 13, borderBottom: "1px solid #35354f" }}>↗️ Forward</button>
                        <button onClick={() => { handleReadBy(msg._id); setContextMenu(null); }} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", textAlign: "left", fontSize: 13, borderBottom: "1px solid #35354f" }}>👁️ Read By</button>
                        {isOwn && <button onClick={() => { handleDelete(msg._id); setContextMenu(null); }} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: "#ef4444", cursor: "pointer", textAlign: "left", fontSize: 13 }}>🗑️ Delete</button>}
                      </div>
                    )}
                  </div>
                );
              })}
              {typingNames.length > 0 && <div style={{ fontSize: 12, color: "#8888aa", fontStyle: "italic" }}>{typingNames.join(", ")} typing...</div>}
              <div ref={messagesEndRef} />
            </div>
            {replyingTo && (
              <div style={{ padding: "12px 16px", background: "rgba(99,102,241,0.1)", borderLeft: "3px solid #6366f1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "#cbd5e1" }}>Replying to <strong>{replyingTo.senderName}</strong></div>
                <button onClick={() => setReplyingTo(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18 }}>✕</button>
              </div>
            )}
            {selectedFiles.length > 0 && (
              <div style={{ padding: "12px 16px", background: "rgba(59,130,246,0.1)", display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                {selectedFiles.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", padding: "6px 10px", borderRadius: 8 }}>
                    <span style={{ fontSize: 12, color: "#cbd5e1" }}>
                      {isAudioFile(f.name) ? `🎵 ${formatDuration(f.duration)}` : f.name.substring(0, 20)}
                    </span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {showStarred && (
              <div style={{ position: "fixed", top: 0, right: 0, width: 360, height: "100vh", background: "#1e1e2e", borderLeft: "1px solid #35354f", zIndex: 250, overflowY: "auto", display: "flex", flexDirection: "column" }} className="chatbox-sidebar-panel">
                <div style={{ padding: "16px", borderBottom: "1px solid #35354f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 600, color: "#e9edef" }}>⭐ Starred Messages</div>
                  <button onClick={() => setShowStarred(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                  {starredMessages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#8888aa", padding: "40px 20px" }}>No starred messages</div>
                  ) : (
                    starredMessages.map((msg, idx) => (
                      <div key={idx} style={{ background: "#2a2a3e", padding: "12px", borderRadius: 8, marginBottom: 8, fontSize: 13, color: "#cbd5e1" }}>
                        <div style={{ fontWeight: 600, color: "#a5b4fc", marginBottom: 4 }}>{msg.senderName}</div>
                        <div>{msg.text}</div>
                        <div style={{ fontSize: 11, color: "#8888aa", marginTop: 4 }}>{new Date(msg.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {showGroupInfo && selectedDepartment && (
              <div style={{ position: "fixed", top: 0, right: 0, width: 360, height: "100vh", background: "#1e1e2e", borderLeft: "1px solid #35354f", zIndex: 250, overflowY: "auto", display: "flex", flexDirection: "column" }} className="chatbox-sidebar-panel">
                <div style={{ padding: "16px", borderBottom: "1px solid #35354f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 600, color: "#e9edef" }}>ℹ️ Group Info</div>
                  <button onClick={() => setShowGroupInfo(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>
                <div style={{ display: "flex", gap: 8, padding: "12px", borderBottom: "1px solid #35354f" }}>
                  <button onClick={() => setGroupInfoTab("members")} style={{ flex: 1, padding: "8px", background: groupInfoTab === "members" ? "#6366f1" : "#35354f", border: "none", color: "#e9edef", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>Members</button>
                  <button onClick={() => setGroupInfoTab("media")} style={{ flex: 1, padding: "8px", background: groupInfoTab === "media" ? "#6366f1" : "#35354f", border: "none", color: "#e9edef", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>Media</button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                  {groupInfoTab === "members" ? (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#8888aa", marginBottom: 8 }}>Admins ({groupAdmins.length})</div>
                      {groupAdmins.map((admin, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px", background: "#2a2a3e", borderRadius: 6, marginBottom: 6 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 600 }}>{getInitials(admin.name)}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: "#e9edef", fontWeight: 600 }}>{admin.name}</div>
                            <div style={{ fontSize: 11, color: "#8888aa" }}>Admin</div>
                          </div>
                        </div>
                      ))}
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#8888aa", marginBottom: 8, marginTop: 16 }}>Members ({groupMembers.length})</div>
                      {groupMembers.map((member, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px", background: "#2a2a3e", borderRadius: 6, marginBottom: 6 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 600 }}>{getInitials(member.name)}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: "#e9edef", fontWeight: 600 }}>{member.name}</div>
                            <div style={{ fontSize: 11, color: "#8888aa" }}>{onlineStatus[member._id]?.online ? "🟢 Online" : "⚫ Offline"}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div>
                      {mediaMessages.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#8888aa", padding: "40px 20px" }}>No media shared</div>
                      ) : (
                        mediaMessages.map((msg, idx) => (
                          <div key={idx} style={{ marginBottom: 12 }}>
                            {isImageFile(msg.fileName) && <img src={`/${msg.fileName}`} alt="media" style={{ width: "100%", borderRadius: 8 }} />}
                            {isVideoFile(msg.fileName) && <video src={`/${msg.fileName}`} style={{ width: "100%", borderRadius: 8 }} controls />}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {showMuteMenu && (
              <div style={{ position: "absolute", top: 50, right: 16, background: "#2a2a3e", border: "1px solid #35354f", borderRadius: 8, zIndex: 200, boxShadow: "0 4px 12px rgba(0,0,0,0.5)", minWidth: 180 }}>
                <button onClick={() => muteChat(viewMode === "private" ? selectedUser : viewMode === "department" ? `department:${selectedDepartment._id}` : "all", 0)} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", textAlign: "left", fontSize: 13, borderBottom: "1px solid #35354f" }}>🔔 Unmute</button>
                <button onClick={() => muteChat(viewMode === "private" ? selectedUser : viewMode === "department" ? `department:${selectedDepartment._id}` : "all", 1)} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", textAlign: "left", fontSize: 13, borderBottom: "1px solid #35354f" }}>🔕 Mute 1 hour</button>
                <button onClick={() => muteChat(viewMode === "private" ? selectedUser : viewMode === "department" ? `department:${selectedDepartment._id}` : "all", 8)} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", textAlign: "left", fontSize: 13, borderBottom: "1px solid #35354f" }}>🔕 Mute 8 hours</button>
                <button onClick={() => muteChat(viewMode === "private" ? selectedUser : viewMode === "department" ? `department:${selectedDepartment._id}` : "all", -1)} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", textAlign: "left", fontSize: 13 }}>🔕 Mute Always</button>
              </div>
            )}
            {showScheduleModal && (
              <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#1e1e2e", border: "1px solid #35354f", borderRadius: 12, padding: "24px", zIndex: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", width: "90%", maxWidth: 400 }} className="chatbox-modal">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: "#e9edef", fontSize: 16 }}>⏰ Schedule Message</div>
                  <button onClick={() => setShowScheduleModal(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>
                <textarea value={scheduleText} onChange={e => setScheduleText(e.target.value)} placeholder="Message text..." style={{ width: "100%", padding: "10px", background: "#2a2a3e", border: "1px solid #35354f", borderRadius: 8, color: "#e9edef", marginBottom: 12, resize: "none", minHeight: 80 }} />
                <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} style={{ width: "100%", padding: "10px", background: "#2a2a3e", border: "1px solid #35354f", borderRadius: 8, color: "#e9edef", marginBottom: 12 }} />
                <button onClick={async () => {
                  if (!scheduleText.trim() || !scheduleAt) return;
                  try {
                    const token = localStorage.getItem("token");
                    let receiverId = "all";
                    if (viewMode === "private" && selectedUser) receiverId = selectedUser;
                    else if (viewMode === "department" && selectedDepartment) receiverId = `department:${selectedDepartment._id}`;
                    await fetch("/api/chat/schedule", {
                      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ text: scheduleText, receiverId, scheduledAt: new Date(scheduleAt).toISOString() })
                    });
                    setScheduleText(""); setScheduleAt(""); setShowScheduleModal(false);
                  } catch (_) {}
                }} style={{ width: "100%", padding: "10px", background: "#6366f1", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 600 }}>Schedule</button>
              </div>
            )}
            {forwardMsg && (
              <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#1e1e2e", border: "1px solid #35354f", borderRadius: 12, padding: "24px", zIndex: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", width: "90%", maxWidth: 400 }} className="chatbox-modal">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: "#e9edef", fontSize: 16 }}>↗️ Forward Message</div>
                  <button onClick={() => setForwardMsg(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>
                <div style={{ background: "#2a2a3e", padding: "12px", borderRadius: 8, marginBottom: 16, fontSize: 13, color: "#cbd5e1" }}>
                  <div style={{ fontWeight: 600, color: "#a5b4fc", marginBottom: 4 }}>{forwardMsg.senderName}</div>
                  <div>{forwardMsg.text}</div>
                </div>
                <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 16 }}>
                  {currentUser?.role === "admin" && (
                    <button onClick={() => { handleForward("all"); setForwardMsg(null); }} style={{ display: "block", width: "100%", padding: "10px", background: "#35354f", border: "none", color: "#cbd5e1", borderRadius: 6, cursor: "pointer", marginBottom: 8, textAlign: "left" }}>🏢 Team Chat</button>
                  )}
                  {departments.map(dept => (
                    <button key={dept._id} onClick={() => { handleForward(`department:${dept._id}`); setForwardMsg(null); }} style={{ display: "block", width: "100%", padding: "10px", background: "#35354f", border: "none", color: "#cbd5e1", borderRadius: 6, cursor: "pointer", marginBottom: 8, textAlign: "left" }}>📁 {dept.name}</button>
                  ))}
                  {staffList.map(staff => (
                    <button key={staff._id} onClick={() => { handleForward(staff._id); setForwardMsg(null); }} style={{ display: "block", width: "100%", padding: "10px", background: "#35354f", border: "none", color: "#cbd5e1", borderRadius: 6, cursor: "pointer", marginBottom: 8, textAlign: "left" }}>👤 {staff.name}</button>
                  ))}
                </div>
              </div>
            )}
            {readByPopup && (
              <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#1e1e2e", border: "1px solid #35354f", borderRadius: 12, padding: "24px", zIndex: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", width: "90%", maxWidth: 300 }} className="chatbox-modal">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: "#e9edef", fontSize: 16 }}>👁️ Read by</div>
                  <button onClick={() => setReadByPopup(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>
                <div>
                  {readByPopup.names.length === 0 ? (
                    <div style={{ color: "#8888aa", fontSize: 13 }}>No one has read this message</div>
                  ) : (
                    readByPopup.names.map((name, idx) => (
                      <div key={idx} style={{ padding: "8px", color: "#cbd5e1", fontSize: 13, borderBottom: "1px solid #35354f" }}>✓ {name}</div>
                    ))
                  )}
                </div>
              </div>
            )}
            {missedCallToast && (
              <div style={{ position: "fixed", bottom: 20, left: 20, background: "#ef4444", color: "#fff", padding: "12px 16px", borderRadius: 8, zIndex: 200, fontSize: 13 }}>
                📞 Missed {missedCallToast.callType} call from {missedCallToast.callerName}
              </div>
            )}
            {activeCall && (
              <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", padding: "32px", borderRadius: 16, zIndex: 200, fontSize: 14, display: "flex", flexDirection: "column", gap: 20, alignItems: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.8)", minWidth: 320 }}>
                <style>{`
                  @keyframes pulse-call {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                  }
                  .calling-icon {
                    animation: pulse-call 1s infinite;
                  }
                `}</style>
                <div style={{ fontSize: 56 }} className="calling-icon">📞</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Calling {activeCall.receiverName}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Waiting for response...</div>
                </div>
                <button onClick={endCall} style={{ background: "#ef4444", border: "none", color: "#fff", padding: "12px 32px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }} onMouseOver={e => e.target.style.background = "#dc2626"} onMouseOut={e => e.target.style.background = "#ef4444"}>✕ End Call</button>
              </div>
            )}
            {incomingCall && (
              <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "linear-gradient(135deg, #3b82f6, #1e40af)", color: "#fff", padding: "32px", borderRadius: 16, zIndex: 200, fontSize: 14, display: "flex", flexDirection: "column", gap: 20, alignItems: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.8)", minWidth: 320 }}>
                <style>{`
                  @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.2); opacity: 0; }
                  }
                  .pulse-icon {
                    animation: pulse-ring 1.5s infinite;
                  }
                `}</style>
                <div style={{ fontSize: 56, position: "relative" }}>
                  <div className="pulse-icon">📞</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{incomingCall.callerName}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Incoming {incomingCall.callType} call...</div>
                </div>
                <div style={{ display: "flex", gap: 16, width: "100%" }}>
                  <button onClick={acceptCall} style={{ flex: 1, background: "#22c55e", border: "none", color: "#fff", padding: "14px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }} onMouseOver={e => e.target.style.background = "#16a34a"} onMouseOut={e => e.target.style.background = "#22c55e"}>✓ Accept</button>
                  <button onClick={declineCall} style={{ flex: 1, background: "#ef4444", border: "none", color: "#fff", padding: "14px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }} onMouseOver={e => e.target.style.background = "#dc2626"} onMouseOut={e => e.target.style.background = "#ef4444"}>✕ Decline</button>
                </div>
              </div>
            )}
            {showVoiceModal && (
              <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400 }}>
                <div style={{ background: "#1e1e2e", borderRadius: 16, padding: "32px", width: "90%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", gap: 24 }} className="chatbox-modal">
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🎙️</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ background: "rgba(99,102,241,0.1)", borderRadius: 12, padding: "20px", textAlign: "center", border: "2px solid rgba(99,102,241,0.3)" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{voiceRecording ? "🔴" : "⭕"}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#6366f1", fontFamily: "monospace" }}>{formatDuration(voiceDuration)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                      <button onClick={voiceRecording ? stopVoiceRecording : startVoiceRecording} style={{ background: voiceRecording ? "#ef4444" : "#6366f1", border: "none", color: "#fff", padding: "12px 28px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}>
                        {voiceRecording ? "⏹️ Stop" : "🎤 Record"}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={discardVoiceNote} style={{ flex: 1, background: "#35354f", border: "none", color: "#cbd5e1", padding: "12px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Cancel</button>
                    <button onClick={sendVoiceNote} disabled={!voiceBlob} style={{ flex: 1, background: voiceBlob ? "#6366f1" : "#35354f", border: "none", color: voiceBlob ? "#fff" : "#8888aa", padding: "12px", borderRadius: 8, cursor: voiceBlob ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 600 }}>Send</button>
                  </div>
                </div>
              </div>
            )}
            <div style={S.inputBar} className="chatbox-input-bar">
              <input type="file" multiple onChange={e => setSelectedFiles(prev => [...prev, ...Array.from(e.target.files || [])])} style={{ display: "none" }} id="fileInput" />
              <button onClick={() => document.getElementById("fileInput").click()} style={{ ...S.actionBtn }} className="chatbox-action-btn">📎</button>
              <button onClick={() => setShowVoiceModal(true)} style={{ ...S.actionBtn }} className="chatbox-action-btn">🎙️</button>
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ ...S.actionBtn, position: "relative" }} className="chatbox-action-btn">
                😊
                {showEmojiPicker && <EmojiPicker onSelect={e => { setText(text + e); setShowEmojiPicker(false); }} onClose={() => setShowEmojiPicker(false)} />}
              </button>
              <textarea ref={inputRef} style={S.textInput} className="chatbox-text-input" value={text} onChange={handleTextChange} onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())} placeholder="Type a message..." />
              <button style={S.sendBtn} className="chatbox-send-btn" onClick={sendMessage}>➤</button>
            </div>
          </>
        )}
      </div>
      {jitsiRoom && (
        <div style={S.jitsiOverlay}>
          <div style={S.jitsiContainer}>
            <div id="jitsi-container" ref={jitsiContainerRef} style={{ width: "100%", height: "100%" }} />
            <button style={S.jitsiEndBtn} onClick={endCall}>End Call</button>
          </div>
        </div>
      )}
    </div>
  );
};

// WhatsApp-inspired color scheme
const WA_SIDEBAR_BG   = "#111b21";
const WA_SIDEBAR_HDR  = "#202c33";
const WA_SIDEBAR_ACT  = "#2a3f4b";
const WA_CHAT_BG      = "#0a0e13";
const WA_BUBBLE_OUT   = "#005c4b";
const WA_BUBBLE_IN    = "#1f2c34";
const WA_TEXT         = "#e9edef";
const WA_TEXT_SUB     = "#8a8a8e";
const WA_HEADER_BG    = "#202c33";
const WA_INPUT_BG     = "#2a3f4b";
const WA_DIVIDER      = "#2a3f4b";
const WA_ACCENT       = "#00a884";

const S = {
  root: { 
    display: "flex", 
    height: "100vh", 
    background: WA_CHAT_BG, 
    fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif", 
    overflow: "hidden",
    flexDirection: "row",
    "@media (max-width: 768px)": { flexDirection: "column" }
  },
  center: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: WA_CHAT_BG },
  spinner: { width: 40, height: 40, border: "4px solid #2a3f4b", borderTop: "4px solid #00a884", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  
  // Sidebar styles - responsive
  sidebar: { 
    width: "clamp(280px, 25vw, 360px)",
    background: WA_SIDEBAR_BG, 
    borderRight: `1px solid ${WA_DIVIDER}`, 
    flexDirection: "column", 
    display: "flex",
    minWidth: 0,
    "@media (max-width: 768px)": {
      width: "100%",
      borderRight: "none",
      borderBottom: `1px solid ${WA_DIVIDER}`,
      maxHeight: "40vh",
      minHeight: "auto"
    }
  },
  sidebarHeader: { 
    background: WA_SIDEBAR_HDR, 
    padding: "clamp(12px, 3vw, 16px)", 
    display: "flex", 
    flexDirection: "column", 
    gap: 12, 
    borderBottom: `1px solid ${WA_DIVIDER}`,
    "@media (max-width: 768px)": { padding: "12px" }
  },
  sidebarTitle: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  sidebarTitleText: { 
    fontWeight: 700, 
    fontSize: "clamp(16px, 4vw, 20px)", 
    color: WA_TEXT,
    "@media (max-width: 768px)": { fontSize: "18px" }
  },
  searchInput: { 
    width: "100%", 
    padding: "clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)", 
    borderRadius: 24, 
    border: "none", 
    background: WA_INPUT_BG, 
    color: WA_TEXT, 
    outline: "none", 
    fontSize: "clamp(12px, 2.5vw, 14px)",
    "@media (max-width: 768px)": { padding: "8px 12px", fontSize: "13px" }
  },
  searchWrap: { position: "relative" },
  searchIcon: { position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: WA_TEXT_SUB, fontSize: "clamp(14px, 3vw, 16px)" },
  sidebarList: { 
    flex: 1, 
    overflowY: "auto", 
    overflowX: "hidden",
    "@media (max-width: 768px)": { maxHeight: "calc(40vh - 120px)" }
  },
  sidebarItem: { 
    display: "flex", 
    alignItems: "center", 
    gap: "clamp(8px, 2vw, 12px)", 
    padding: "clamp(6px, 1.5vw, 8px)", 
    margin: "0 clamp(4px, 1vw, 8px)", 
    cursor: "pointer", 
    borderRadius: 8, 
    transition: "background 0.2s",
    "@media (max-width: 768px)": { gap: "8px", padding: "6px", margin: "0 4px" }
  },
  sidebarItemActive: { background: WA_SIDEBAR_ACT },
  sidebarItemHover: { background: "rgba(255,255,255,0.05)" },
  sectionHeader: { 
    padding: "clamp(10px, 2vw, 12px) clamp(12px, 3vw, 16px)", 
    cursor: "pointer", 
    background: "transparent", 
    fontSize: "clamp(11px, 2vw, 13px)", 
    fontWeight: 700, 
    color: WA_TEXT_SUB, 
    textTransform: "uppercase", 
    letterSpacing: "0.5px",
    "@media (max-width: 768px)": { padding: "10px 12px", fontSize: "11px" }
  },
  sidebarItemInfo: { flex: 1, minWidth: 0 },
  sidebarItemName: { 
    fontSize: "clamp(13px, 2.5vw, 15px)", 
    color: WA_TEXT, 
    fontWeight: 500, 
    whiteSpace: "nowrap", 
    overflow: "hidden", 
    textOverflow: "ellipsis",
    "@media (max-width: 768px)": { fontSize: "13px" }
  },
  sidebarItemPreview: { 
    fontSize: "clamp(11px, 2vw, 13px)", 
    color: WA_TEXT_SUB, 
    whiteSpace: "nowrap", 
    overflow: "hidden", 
    textOverflow: "ellipsis", 
    marginTop: 2,
    "@media (max-width: 768px)": { fontSize: "11px" }
  },
  badge: { 
    background: WA_ACCENT, 
    color: "#fff", 
    borderRadius: 12, 
    padding: "4px 8px", 
    fontSize: "clamp(10px, 2vw, 12px)", 
    fontWeight: 600, 
    minWidth: 20, 
    textAlign: "center",
    "@media (max-width: 768px)": { fontSize: "10px" }
  },
  avatarWrap: { position: "relative", flexShrink: 0 },
  onlineDot: { position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: "#31a24c", border: `3px solid ${WA_SIDEBAR_BG}` },
  avatar: { 
    width: "clamp(40px, 8vw, 50px)", 
    height: "clamp(40px, 8vw, 50px)", 
    borderRadius: "50%", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    color: "#fff", 
    fontWeight: 600, 
    fontSize: "clamp(14px, 3vw, 18px)", 
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "@media (max-width: 768px)": { width: "40px", height: "40px", fontSize: "14px" }
  },
  
  // Main chat area - responsive
  main: { 
    flex: 1, 
    flexDirection: "column", 
    background: WA_CHAT_BG, 
    display: "flex",
    minWidth: 0,
    "@media (max-width: 768px)": { flex: 1, minHeight: "60vh" }
  },
  welcome: { flex: 1, alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" },
  welcomeIcon: { 
    fontSize: "clamp(60px, 15vw, 100px)", 
    marginBottom: "clamp(12px, 3vw, 20px)", 
    opacity: 0.3,
    "@media (max-width: 768px)": { fontSize: "60px", marginBottom: "12px" }
  },
  welcomeText: { 
    fontSize: "clamp(16px, 4vw, 20px)", 
    color: WA_TEXT, 
    fontWeight: 500, 
    marginBottom: 8,
    "@media (max-width: 768px)": { fontSize: "16px" }
  },
  welcomeSub: { 
    fontSize: "clamp(12px, 3vw, 14px)", 
    color: WA_TEXT_SUB,
    "@media (max-width: 768px)": { fontSize: "12px" }
  },
  
  // Chat header - responsive
  chatHeader: { 
    display: "flex", 
    alignItems: "center", 
    padding: "clamp(10px, 2vw, 12px) clamp(12px, 3vw, 16px)", 
    background: WA_HEADER_BG, 
    borderBottom: `1px solid ${WA_DIVIDER}`, 
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    "@media (max-width: 768px)": { padding: "10px 12px" }
  },
  chatHeaderInfo: { 
    display: "flex", 
    alignItems: "center", 
    gap: "clamp(8px, 2vw, 12px)", 
    flex: 1, 
    minWidth: 0,
    "@media (max-width: 768px)": { gap: "8px" }
  },
  chatHeaderName: { 
    fontWeight: 600, 
    color: WA_TEXT, 
    fontSize: "clamp(13px, 3vw, 15px)",
    "@media (max-width: 768px)": { fontSize: "13px" }
  },
  chatHeaderStatus: { 
    fontSize: "clamp(10px, 2vw, 12px)", 
    color: WA_TEXT_SUB, 
    marginTop: 2,
    "@media (max-width: 768px)": { fontSize: "10px" }
  },
  chatHeaderActions: { 
    display: "flex", 
    gap: "clamp(4px, 1vw, 8px)", 
    alignItems: "center",
    flexWrap: "wrap",
    "@media (max-width: 768px)": { gap: "4px" }
  },
  headerBtn: { 
    background: "none", 
    border: "none", 
    fontSize: "clamp(16px, 4vw, 20px)", 
    cursor: "pointer", 
    color: WA_TEXT_SUB, 
    padding: "clamp(6px, 1.5vw, 8px)", 
    borderRadius: 50, 
    transition: "background 0.2s",
    "@media (max-width: 768px)": { fontSize: "16px", padding: "6px" }
  },
  headerBtnHover: { background: "rgba(255,255,255,0.1)" },
  
  // Messages - responsive
  messagesList: { 
    flex: 1, 
    overflowY: "auto", 
    padding: "clamp(12px, 3vw, 16px) clamp(12px, 3vw, 20px)", 
    display: "flex", 
    flexDirection: "column", 
    gap: "clamp(6px, 1.5vw, 8px)", 
    backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><defs><pattern id=\"pattern\" x=\"0\" y=\"0\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><text x=\"50\" y=\"50\" font-size=\"80\" fill=\"rgba(255,255,255,0.02)\" text-anchor=\"middle\" dominant-baseline=\"middle\">💬</text></pattern></defs><rect width=\"100%\" height=\"100%\" fill=\"%230a0e13\"/><rect width=\"100%\" height=\"100%\" fill=\"url(%23pattern)\"/></svg>')",
    "@media (max-width: 768px)": { padding: "12px", gap: "6px" }
  },
  msgRow: { display: "flex", marginBottom: 4, width: "100%" },
  msgRowOwn: { justifyContent: "flex-end" },
  msgRowOther: { justifyContent: "flex-start" },
  msgSenderName: { 
    fontSize: "clamp(10px, 2vw, 12px)", 
    fontWeight: 700, 
    color: WA_ACCENT, 
    marginBottom: 4,
    "@media (max-width: 768px)": { fontSize: "10px" }
  },
  bubble: { 
    padding: "clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 12px)", 
    borderRadius: 8, 
    maxWidth: "clamp(70%, 85vw, 75%)", 
    wordWrap: "break-word", 
    boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
    "@media (max-width: 768px)": { maxWidth: "85%", padding: "6px 10px" }
  },
  bubbleOwn: { background: WA_BUBBLE_OUT, color: WA_TEXT, borderBottomRightRadius: 4, marginLeft: "auto" },
  bubbleOther: { background: WA_BUBBLE_IN, color: WA_TEXT, borderBottomLeftRadius: 4, marginRight: "auto" },
  msgText: { 
    fontSize: "clamp(12px, 2.5vw, 14px)", 
    lineHeight: 1.4,
    "@media (max-width: 768px)": { fontSize: "12px" }
  },
  msgMeta: { display: "flex", alignItems: "center", gap: 4, marginTop: 4, justifyContent: "flex-end" },
  msgTime: { 
    fontSize: "clamp(10px, 2vw, 12px)", 
    color: "rgba(255,255,255,0.6)",
    "@media (max-width: 768px)": { fontSize: "10px" }
  },
  msgStatus: { fontSize: 12 },
  
  // Input area - responsive
  inputBar: { 
    display: "flex", 
    padding: "clamp(10px, 2vw, 12px) clamp(12px, 3vw, 16px)", 
    background: WA_HEADER_BG, 
    gap: "clamp(8px, 2vw, 12px)", 
    alignItems: "flex-end", 
    borderTop: `1px solid ${WA_DIVIDER}`,
    flexWrap: "wrap",
    "@media (max-width: 768px)": { padding: "10px 12px", gap: "8px" }
  },
  inputActions: { display: "flex", gap: 8 },
  actionBtn: { 
    background: "none", 
    border: "none", 
    fontSize: "clamp(16px, 4vw, 20px)", 
    cursor: "pointer", 
    color: WA_ACCENT, 
    padding: "clamp(6px, 1.5vw, 8px)", 
    borderRadius: 50, 
    transition: "background 0.2s",
    "@media (max-width: 768px)": { fontSize: "16px", padding: "6px" }
  },
  textInput: { 
    flex: 1, 
    padding: "clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)", 
    borderRadius: 20, 
    border: "none", 
    background: WA_INPUT_BG, 
    color: WA_TEXT, 
    outline: "none", 
    resize: "none", 
    fontSize: "clamp(12px, 2.5vw, 14px)", 
    maxHeight: 100,
    minHeight: "clamp(32px, 6vw, 40px)",
    "@media (max-width: 768px)": { padding: "8px 12px", fontSize: "12px", minHeight: "32px" }
  },
  sendBtn: { 
    background: WA_ACCENT, 
    color: "#fff", 
    border: "none", 
    borderRadius: "50%", 
    width: "clamp(36px, 8vw, 40px)", 
    height: "clamp(36px, 8vw, 40px)", 
    cursor: "pointer", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontSize: "clamp(14px, 3vw, 18px)", 
    transition: "background 0.2s",
    "@media (max-width: 768px)": { width: "36px", height: "36px", fontSize: "14px" }
  },
  
  // Jitsi - responsive
  jitsiOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.95)", zIndex: 1000 },
  jitsiContainer: { 
    position: "relative", 
    width: "clamp(90%, 95vw, 95%)", 
    height: "clamp(85vh, 90vh, 95%)", 
    margin: "auto",
    "@media (max-width: 768px)": { width: "100%", height: "100%", margin: 0 }
  },
  jitsiEndBtn: { 
    position: "absolute", 
    bottom: "clamp(12px, 3vw, 20px)", 
    left: "50%", 
    transform: "translateX(-50%)", 
    padding: "clamp(10px, 2vw, 12px) clamp(20px, 4vw, 24px)", 
    background: "#ef4444", 
    color: "#fff", 
    border: "none", 
    borderRadius: 8, 
    cursor: "pointer", 
    fontWeight: 600,
    fontSize: "clamp(12px, 2.5vw, 14px)",
    "@media (max-width: 768px)": { padding: "10px 20px", fontSize: "12px", bottom: "12px" }
  }
};

export default ChatBox;
