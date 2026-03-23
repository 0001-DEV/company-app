import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import PollWidget from "../components/PollWidget";

const EMOJI_CATEGORIES = [
  { label: "😀", name: "Smileys", emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"] },
  { label: "👋", name: "People", emojis: ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🙏","✍️","💅","🤳","💪","🦾","🦵","🦶","👃","👀","👅","👄","💋","👶","🧒","👦","👧","🧑","👱","👨","🧔","👩","🧓","👴","👵","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇","🤦","🤷"] },
  { label: "❤️", name: "Hearts", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟"] },
  { label: "🐶", name: "Animals", emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","蚊","コオロギ","スパイダー","サソリ","カメ","ヘビ","トカゲ","タコ","イカ","エビ","ロブスター","カニ","フグ","魚","熱帯魚","イルカ","クジラ1","クジラ2","サメ","ワニ","タイガー","ヒョウ","ゼブラ","ゴリラ","ゾウ","カバ","サイ","ラクダ1","ラクダ2","キリン","カンガルー","水牛","雄牛","雌牛","馬","豚","羊1","羊2","ラマ","山羊","鹿","犬","プードル","猫","ニワトリ","七面鳥","クジャク","オウム","白鳥","フラミンゴ","鳩","ウサギ","アライグマ","スカンク","アナグマ","カワウソ","マウス","ラット","リス","ハリネズミ"] },
  { label: "🍎", name: "Food", emojis: ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","ブルーベリー","メロン","チェリー","ピーチ","マンゴー","パイン","ココナッツ","キウイ","トマト","ナス","アボカド","ブロッコリー","レタス","キュウリ","唐辛子","ピーマン","ニンニク","タマネギ","ジャガイモ","サツマイモ","クロワッサン","ベーグル","パン","バゲット","プレッツェル","チーズ","卵","目玉焼き","バター","パンケーキ","ワッフル","ベーコン","ステーキ","チキン","肉","ホットドッグ","バーガー","ポテト","ピザ","ナン","サンドイッチ","ケバブ","ファラフェル","タコス","ブリトー","タマル","サラダ","パエリア","鍋","缶詰","パスタ","ラーメン","シチュー","カレー","寿司","弁当","餃子","オイスター","天ぷら","おにぎり","ご飯","せんべい","なると","月見団子","おでん","カップケーキ","ケーキ","誕生日ケーキ","プリン","キャンディ","飴","チョコ","ポップコーン","ドーナツ","クッキー","栗","ピーナッツ","蜂蜜","ジュース","カップ","タピオカ","コーヒー","お茶","ティーポット","ビール","乾杯","ワイングラス","ワイン","ウィスキー","カクテル","トロピカルドリンク","マテ茶","シャンパン","氷","スプーン","フォーク","皿","箸","塩"] },
  { label: "⚽", name: "Activity", emojis: ["⚽","🏀","🏈","⚾","ソフトボール","テニス","バレー","ラグビー","ビリヤード","ヨーヨー","卓球","バドミントン","ホッケー","フィールドホッケー","ラクロス","クリケット","ブーメラン","ゴルフ","凧","弓矢","釣り","シュノーケル","ボクシング","空手","ユニフォーム","スケボー","ローラースケート","そり","スケート","カーリング","スキー1","スキー2","スノボ","パラシュート","重量挙げ","レスリング","バスケ","フェンシング","乗馬","ヨガ","サーフィン","水泳","水球","ボート","登山","自転車","トロフィー","金メダル","銀メダル","銅メダル","メダル","軍事勲章","ロゼット","リボン","チケット","入場券","サーカス","ジャグリング","演劇","バレエ","絵画","映画","マイク","ヘッドホン","音符","ピアノ","ドラム","🪘","サックス","トランペット","ギター","バンジョー","バイオリン","ダイス","チェス","ダーツ","ボウリング","ゲーム","スロット","パズル"] },
  { label: "🚗", name: "Travel", emojis: ["🚗","タクシー","SUV","バス","トロリーバス","レースカー","パトカー","救急車","消防車","ミニバン","ピックアップトラック","トラック","大型トラック","バイク","スクーター","三輪車","自転車","キックボード","スケボー","ローラースケート","バス停","高速道路","線路","給油","パトランプ","信号","歩行者信号","通行止め","工事中","錨","救命浮環","帆船","モーターボート","客船","フェリー","船","飛行機","小型飛行機","離陸","着陸","パラシュート","座席","ヘリコプター","モノレール","ロープウェイ","ゴンドラ","人工衛星","ロケット","UFO","惑星","地球1","地球2","地球3","地球儀","地図","コンパス","山","山頂","火山","富士山","キャンプ","砂浜","砂漠","島","公園","スタジアム","古典的な建物","建設中","レンガ","石","薪","小屋","住宅街","廃屋","家","庭付きの家","オフィス","郵便局","日本郵便","病院","銀行","ホテル","ラブホテル","コンビニ","学校","デパート","工場","城","西洋の城","結婚式","東京タワー","自由の女神","教会","モスク","ヒンドゥー寺院","シナゴーグ","鳥居","カアバ"] },
  { label: "💡", name: "Objects", emojis: ["💡","懐中電灯","キャンドル","ランプ","消火器","ドラム缶","金袋","円札","ドル札","ユーロ札","ポンド札","飛んでいるお金","クレジットカード","コイン","チャート上昇","チャート下落","棒グラフ","クリップボード","ノート","カレンダー1","カレンダー2","カレンダー3","ゴミ箱","フォルダ1","フォルダ2","インデックス","インデックスボックス","キャビネット","ピン","プッシュピン","はさみ","クリップ1","クリップ2","ペン","万年筆","筆","クレヨン","メモ","鉛筆","虫眼鏡1","虫眼鏡2","鍵1","鍵2","南京錠","開いた南京錠"] },
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
    const beat = async () => { try { const token = localStorage.getItem("token"); await fetch("http://localhost:5000/api/chat/heartbeat", { method: "POST", headers: { Authorization: `Bearer ${token}` } }); } catch (_) {} };
    beat(); const iv = setInterval(beat, 20000); return () => clearInterval(iv);
  }, [currentUser]);

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
        const res = await fetch("http://localhost:5000/api/chat/unread-counts", { headers: { Authorization: `Bearer ${token}` } });
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
        const res = await fetch("http://localhost:5000/api/chat/last-messages", { headers: { Authorization: `Bearer ${token}` } });
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
        let url = "http://localhost:5000/api/chat/messages";
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
        const res = await fetch("http://localhost:5000/api/chat/starred", { headers: { Authorization: `Bearer ${token}` } });
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
        const res = await fetch(`http://localhost:5000/api/chat/pins?departmentId=${selectedDepartment._id}`, { headers: { Authorization: `Bearer ${token}` } });
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
        const res = await fetch(`http://localhost:5000/api/chat/media?departmentId=${selectedDepartment._id}`, { headers: { Authorization: `Bearer ${token}` } });
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
      const res = await fetch("http://localhost:5000/api/chat/message", {
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
      await fetch("http://localhost:5000/api/chat/typing", {
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
      if (incoming) {
        const iv = setInterval(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          osc.start(); osc.stop(ctx.currentTime + 0.5);
        }, 1000);
        ctx._ringInterval = iv;
      }
    } catch (_) {}
  };

  const stopRing = () => {
    if (ringAudioRef.current) {
      if (ringAudioRef.current._ringInterval) clearInterval(ringAudioRef.current._ringInterval);
      ringAudioRef.current.close();
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
    setJitsiRoom(null);
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
      await fetch(`http://localhost:5000/api/chat/messages/${msgId}/react`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emoji })
      });
      reloadMessages();
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

  const handleDelete = async (msgId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/chat/messages/${msgId}`, {
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
      await fetch("http://localhost:5000/api/chat/message", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData
      });
      setForwardMsg(null);
    } catch (_) {}
  };

  const handleMessageClick = (msg, e) => {
    e.stopPropagation();
    setContextMenu({ msg, x: e.clientX, y: e.clientY });
  };

  const loadGroupInfo = async (dept) => {
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
      {/* ── SIDEBAR ── */}
      <div style={{ ...S.sidebar, display: isMobile && viewMode !== "none" ? "none" : "flex" }}>
        <div style={S.sidebarHeader}>
          <div style={S.sidebarTitle}><span style={{ fontWeight: 700, fontSize: 18, color: "#e9edef" }}>Chats</span></div>
          <div style={S.searchWrap}>
            <span style={S.searchIcon}>🔍</span>
            <input placeholder="Search chats..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={S.searchInput} />
          </div>
        </div>
        <div style={S.sidebarList}>
          {currentUser?.role === "admin" && (
            <div style={{ ...S.sidebarItem, ...(viewMode === "all" ? S.sidebarItemActive : {}) }}
              onClick={() => { setViewMode("all"); setSelectedUser(null); setSelectedDepartment(null); markAsRead(null, { teamChat: true }); }}>
              <div style={{ ...S.avatar, background: "linear-gradient(135deg,#f59e0b,#d97706)", width: 40, height: 40 }}>🏢</div>
              <div style={S.sidebarItemInfo}><div style={S.sidebarItemName}>Team Chat</div></div>
              {unreadCounts["all"] > 0 && <div style={S.badge}>{unreadCounts["all"]}</div>}
            </div>
          )}
          <div style={S.sectionHeader} onClick={() => setDeptSectionOpen(v => !v)}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#8696a0" }}>Departments</span>
          </div>
          {deptSectionOpen && filteredDepts.map(dept => (
            <div key={dept._id} style={{ ...S.sidebarItem, ...(selectedDepartment?._id === dept._id ? S.sidebarItemActive : {}) }}
              onClick={() => { setViewMode("department"); setSelectedDepartment(dept); setSelectedUser(null); loadGroupInfo(dept); markAsRead(null, { departmentId: dept._id }); }}>
              <div style={{ ...S.avatar, background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", width: 38, height: 38 }}>{getInitials(dept.name)}</div>
              <div style={S.sidebarItemInfo}><div style={S.sidebarItemName}>{dept.name}</div></div>
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
                <div style={{ ...S.avatar, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", width: 38, height: 38 }}>{getInitials(staff.name)}</div>
                <div style={{ ...S.onlineDot, background: onlineStatus[staff._id]?.online ? "#22c55e" : "#64748b" }} />
              </div>
              <div style={S.sidebarItemInfo}><div style={S.sidebarItemName}>{staff.name}</div></div>
              {(unreadCounts[staff._id] || 0) > 0 && <div style={S.badge}>{unreadCounts[staff._id]}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div style={{ ...S.main, display: isMobile && viewMode === "none" ? "none" : "flex" }}>
        {viewMode === "none" ? (
          <div style={S.welcome}><div style={{ fontSize: 72, opacity: 0.3 }}>💬</div></div>
        ) : (
          <>
            <div style={S.chatHeader}>
              <div style={S.chatHeaderInfo}>
                <div style={{ ...S.avatar, width: 38, height: 38, background: "#6b7280" }}>
                  {selectedDepartment ? getInitials(selectedDepartment.name) : viewMode === "all" ? "🏢" : getInitials(staffList.find(s => s._id === selectedUser)?.name || "")}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "#e9edef" }}>
                    {selectedDepartment ? selectedDepartment.name : viewMode === "all" ? "Team Chat" : staffList.find(s => s._id === selectedUser)?.name}
                  </div>
                </div>
              </div>
              <div style={S.chatHeaderActions}>
                <button style={S.headerBtn} onClick={() => startCall("voice")}>📞</button>
                <button style={S.headerBtn} onClick={() => startCall("video")}>📹</button>
              </div>
            </div>
            <div style={S.messagesList} ref={messagesContainerRef}>
              {messages.map((msg, idx) => {
                const isOwn = msg.senderId?.toString() === currentUser?.id?.toString();
                return (
                  <div key={msg._id || idx} style={{ ...S.msgRow, justifyContent: isOwn ? "flex-end" : "flex-start" }}>
                    <div style={{ ...S.bubble, ...(isOwn ? S.bubbleOwn : S.bubbleOther) }} onClick={e => handleMessageClick(msg, e)}>
                      {!isOwn && <div style={S.msgSenderName}>{msg.senderName}</div>}
                      <div style={S.msgText}>{renderMentions(msg.text, currentUser?.name, staffList)}</div>
                      <div style={S.msgMeta}><span style={S.msgTime}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div style={S.inputBar}>
              <textarea style={S.textInput} value={text} onChange={handleTextChange} onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())} />
              <button style={S.sendBtn} onClick={sendMessage}>➤</button>
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

const WA_SIDEBAR_BG   = "#1e1e2e";
const WA_SIDEBAR_HDR  = "#2a2a3e";
const WA_SIDEBAR_ACT  = "#35354f";
const WA_CHAT_BG      = "#16161f";
const WA_BUBBLE_OUT   = "#3a3a5c";
const WA_BUBBLE_IN    = "#2a2a3e";
const WA_TEXT         = "#e2e2f0";
const WA_TEXT_SUB     = "#8888aa";
const WA_HEADER_BG    = "#2a2a3e";
const WA_INPUT_BG     = "#35354f";
const WA_DIVIDER      = "#35354f";

const S = {
  root: { display: "flex", height: "100vh", background: WA_CHAT_BG, fontFamily: "sans-serif", overflow: "hidden" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: WA_CHAT_BG },
  spinner: { width: 40, height: 40, border: "4px solid #35354f", borderTop: "4px solid #9090c0", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  sidebar: { width: 360, background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(10px)", borderRight: `1px solid rgba(255, 255, 255, 0.1)`, flexDirection: "column" },
  sidebarHeader: { background: "rgba(255, 255, 255, 0.06)", backdropFilter: "blur(8px)", padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8, borderBottom: "1px solid rgba(255, 255, 255, 0.1)" },
  sidebarTitle: { display: "flex", alignItems: "center" },
  searchInput: { width: "100%", padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.2)", background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(8px)", color: WA_TEXT, outline: "none", transition: "all 0.3s ease" },
  searchWrap: { position: "relative" },
  searchIcon: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: WA_TEXT_SUB },
  sidebarList: { flex: 1, overflowY: "auto" },
  sidebarItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", borderBottom: `1px solid rgba(255, 255, 255, 0.05)`, transition: "all 0.2s ease" },
  sidebarItemActive: { background: "rgba(99, 102, 241, 0.2)", backdropFilter: "blur(8px)" },
  sectionHeader: { padding: "10px 16px", cursor: "pointer", background: "rgba(255, 255, 255, 0.06)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" },
  sidebarItemInfo: { flex: 1 },
  sidebarItemName: { fontSize: 15, color: WA_TEXT },
  badge: { background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", borderRadius: 10, padding: "2px 7px", fontSize: 11, boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)" },
  avatarWrap: { position: "relative" },
  onlineDot: { position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", border: "2px solid #1e1e2e" },
  avatar: { width: 46, height: 46, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" },
  main: { flex: 1, flexDirection: "column", background: WA_CHAT_BG },
  welcome: { flex: 1, alignItems: "center", justifyContent: "center" },
  chatHeader: { display: "flex", alignItems: "center", padding: "10px 16px", background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(10px)", borderBottom: `1px solid rgba(255, 255, 255, 0.1)` },
  chatHeaderInfo: { display: "flex", alignItems: "center", gap: 12, flex: 1 },
  chatHeaderActions: { display: "flex", gap: 8 },
  headerBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: WA_TEXT_SUB, transition: "all 0.2s ease" },
  messagesList: { flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 },
  msgRow: { display: "flex" },
  msgSenderName: { fontSize: 12, fontWeight: 700, color: "#a5b4fc", marginBottom: 4 },
  bubble: { padding: "8px 12px", borderRadius: 12, maxWidth: "70%", backdropFilter: "blur(8px)" },
  bubbleOwn: { background: "rgba(99, 102, 241, 0.2)", color: WA_TEXT, border: "1px solid rgba(99, 102, 241, 0.3)" },
  bubbleOther: { background: "rgba(255, 255, 255, 0.1)", color: WA_TEXT, border: "1px solid rgba(255, 255, 255, 0.15)" },
  msgText: { fontSize: 14 },
  msgMeta: { textAlign: "right", marginTop: 4 },
  msgTime: { fontSize: 11, color: WA_TEXT_SUB },
  inputBar: { display: "flex", padding: "16px", background: "rgba(255, 255, 255, 0.06)", backdropFilter: "blur(10px)", gap: 12, borderTop: "1px solid rgba(255, 255, 255, 0.1)" },
  textInput: { flex: 1, padding: "10px", borderRadius: 12, border: "1px solid rgba(255, 255, 255, 0.2)", background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(8px)", color: WA_TEXT, outline: "none", resize: "none", transition: "all 0.3s ease" },
  sendBtn: { background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", border: "none", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)", transition: "all 0.2s ease" },
  jitsiOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 1000 },
  jitsiContainer: { position: "relative", width: "90%", height: "90%", margin: "2% auto" },
  jitsiEndBtn: { position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", padding: "10px 20px", background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)", transition: "all 0.2s ease" }
};

export default ChatBox;
