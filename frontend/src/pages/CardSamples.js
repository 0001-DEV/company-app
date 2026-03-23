import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import card0 from '../assets/cards/CARD 0.jpeg';
import card1 from '../assets/cards/CARD 1.jpeg';
import card2 from '../assets/cards/CARD 2.jpeg';
import card3 from '../assets/cards/CARD 3.jpeg';
import cardMaint  from '../assets/cards/CARD MAINT.jpeg';
import cardMaint0 from '../assets/cards/CARD MAINT 0.jpeg';
import cardMaint1 from '../assets/cards/CARD MAINT 1.jpeg';
import cod  from '../assets/cards/cod.jpeg';
import cod0 from '../assets/cards/cod0.jpeg';
import cod1 from '../assets/cards/cod1.jpeg';
import matEggshell    from '../assets/cards/eggshell-plastic-id-card.jpg';
import matNubis       from '../assets/cards/Nubis Plastic ID Card.jpg';
import matTranslux    from '../assets/cards/Translux -Transparent Plastic ID Card.jpg';
import matClassicLustre from '../assets/cards/Classic Lustre Plastic ID Card.png';
import matMetal from '../assets/cards/METAL CARD.jpeg';
import matBamboo from '../assets/cards/BAMBOO CARD.jpeg';

// Duplex Card Samples
import duplex0 from '../assets/cards/CARD 0.jpeg';
import duplex1 from '../assets/cards/CARD 1.jpeg';
import duplex2 from '../assets/cards/CARD 2.jpeg';
import duplex3 from '../assets/cards/CARD 3.jpeg';

// De-Titan Card Samples
import titan0 from '../assets/cards/DE-TITAN CARD SAMPLES.0.jpeg';
import titan1 from '../assets/cards/DE-TITAN CARD SAMPLES.1.jpeg';
import titan2 from '../assets/cards/DE-TITAN CARD SAMPLES.jpeg';

// Bamboo Card Samples
import bamboo0 from '../assets/cards/BAMBOO CARD.0.jpeg';
import bamboo1 from '../assets/cards/BAMBOO CARD.1.jpeg';
import bamboo2 from '../assets/cards/BAMBOO CARD.jpeg';

// Other assets
import lanyard0 from '../assets/cards/LANYARD.0.jpeg';
import activities0 from '../assets/cards/STAFF ACTIVITIES.0.jpeg';

// Video Assets
import videoHowToUse from '../assets/Videos/HOW TO USE OUR SMART CARDS.mp4';
import videoClassicLustre from '../assets/Videos/classic-lustre.mp4';
import videoEggShell from '../assets/Videos/Egg-Shell.mp4';
import videoTranslux from '../assets/Videos/translux.mp4';
import videoNubix from '../assets/Videos/nubis.mp4';

const materials = [
  { id:'eggshell',      group:'plastic', name:'Eggshell',       tagline:'Subtle texture, premium feel',      photo:matEggshell,    accent:'#c8a97e', badge:'Eggshell',       badgeBg:'#fdf6ee', badgeColor:'#92400e', description:'A lightly textured plastic finish that mimics the natural feel of an eggshell surface. Soft to the touch, it gives cards a refined, understated luxury that stands out without being loud.', specs:['Textured PVC surface','Matte-like tactile feel','Full-color print support','Durable & water-resistant','Standard CR80 card size'], bestFor:['Executive business cards','Premium ID cards','Corporate branding'] },
  { id:'nubis',         group:'plastic', name:'Nubis',          tagline:'Velvety soft-touch luxury',         photo:matNubis,       accent:'#a78bfa', badge:'Nubis',          badgeBg:'#1a1a1a', badgeColor:'#ffffff', description:'Nubis is our premium soft-touch plastic finish — a velvety, suede-like coating that feels as luxurious as it looks. Dark, rich, and sophisticated. The card that makes people ask "what is this made of?"', specs:['Soft-touch velvet coating','Anti-fingerprint surface','Spot UV compatible','Deep color saturation','Premium weight PVC'], bestFor:['Luxury business cards','VIP membership cards','High-end brand identity'] },
  { id:'translux',      group:'plastic', name:'Translux',       tagline:'See-through elegance',              photo:matTranslux,    accent:'#60a5fa', badge:'Translux',       badgeBg:'#eff6ff', badgeColor:'#1d4ed8', description:'Translux is our transparent/frosted plastic card — a clear or semi-frosted PVC that creates a stunning visual effect. Designs appear to float on the card surface, making it one of our most eye-catching options.', specs:['Clear or frosted PVC','Floating design effect','UV print on transparent base','NFC chip compatible','Unique visual impact'], bestFor:['Creative professionals','Tech companies','NFC smart cards'] },
  { id:'classic-lustre',group:'plastic', name:'Classic Lustre', tagline:'Timeless gloss perfection',         photo:matClassicLustre,accent:'#34d399',badge:'Classic Lustre', badgeBg:'#f0f9ff', badgeColor:'#0369a1', description:'Classic Lustre is our standard high-gloss PVC — vibrant, sharp, and professional. The go-to finish for full-color designs that need to pop. Crisp edges, vivid colors, and a mirror-like shine that never goes out of style.', specs:['High-gloss PVC laminate','Vivid full-color CMYK print','Sharp edge definition','Scratch-resistant coating','Most affordable premium option'], bestFor:['Standard business cards','Staff ID cards','COD & maintenance cards'] },
  { id:'metal',         group:'metal',   name:'Metal Cards',    tagline:'Stainless steel authority',         photo:matMetal,accent:'#c8a97e',badge:'Metal Card', badgeBg:'#c8a97e', badgeColor:'#e5e7eb', description:'Our metal cards are crafted from premium stainless steel with laser engraving and optional NFC chip embedding. Heavy, cold to the touch, and unmistakably premium — the card that commands respect the moment it lands in someone\'s hand.', specs:['Stainless steel construction','Laser engraving','NFC chip embeddable','Brushed or mirror finish','Heavyweight (~20g)'], bestFor:['C-suite executives','Luxury brand identity','NFC networking cards'] },
  { id:'bamboo',        group:'natural', name:'Bamboo Cards',   tagline:'Natural. Sustainable. Unique.',     photo:matBamboo,accent:'#c8a97e',badge:'Bamboo', badgeBg:'#60a5fa', badgeColor:'#854d0e', description:'Real bamboo veneer cards — each one is unique because nature made it that way. Warm, organic, and eco-conscious. Laser-engraved designs on genuine bamboo create a texture and character no plastic card can replicate.', specs:['Real bamboo veneer','Laser engraving','Each card is unique','Eco-friendly material','Natural grain texture'], bestFor:['Eco-conscious brands','Creative agencies','Organic & wellness brands'] },
];

const samples = [
  { id:1,  image:duplex0,    title:'Duplex Card',      subtitle:'Classic Lustre Sample', material:'classic-lustre', type:'Duplex Card',      tag:'Business', isDuplex: true, gallery:[duplex1, duplex2, duplex3] },
  { id:2,  image:titan2,     title:'De-Titan Card',    subtitle:'Nubis finish',          material:'nubis',          type:'Titan Card',       tag:'Business', gallery:[titan0, titan1] },
  { id:3,  image:bamboo2,    title:'Bamboo Card',      subtitle:'Natural finish',        material:'bamboo',         type:'Bamboo Card',      tag:'NFC', gallery:[bamboo0, bamboo1] },
  { id:4,  image:card2,      title:'NFC Smart Card',   subtitle:'Translux transparent',  material:'translux',       type:'NFC Smart Card',   tag:'NFC' },
  { id:5,  image:card3,      title:'NFC Smart Card',   subtitle:'Eggshell texture',      material:'eggshell',       type:'NFC Smart Card',   tag:'NFC' },
  { id:6,  image:cardMaint,  title:'Maintenance Card', subtitle:'Classic Lustre finish', material:'classic-lustre', type:'Maintenance Card', tag:'Maintenance' },
  { id:7,  image:cardMaint0, title:'Maintenance Card', subtitle:'Eggshell texture',      material:'eggshell',       type:'Maintenance Card', tag:'Maintenance' },
  { id:8,  image:cardMaint1, title:'Maintenance Card', subtitle:'Nubis soft-touch',      material:'nubis',          type:'Maintenance Card', tag:'Maintenance' },
  { id:9,  image:cod,        title:'COD Card',         subtitle:'Classic Lustre finish', material:'classic-lustre', type:'COD Card',         tag:'COD' },
  { id:10, image:cod0,       title:'COD Card',         subtitle:'Translux transparent',  material:'translux',       type:'COD Card',         tag:'COD' },
  { id:11, image:cod1,       title:'COD Card',         subtitle:'Eggshell texture',      material:'eggshell',       type:'COD Card',         tag:'COD' },
  { id:12, image:lanyard0,   title:'Branded Lanyard',  subtitle:'Premium weave',         material:'lanyard',        type:'Accessory',        tag:'Maintenance' },
  { id:13, image:activities0,title:'Staff Activity',    subtitle:'Workshop view',         material:'workshop',       type:'Activity',         tag:'Business' },
];

const whyUs = [
  { icon:'🥇', title:"Nigeria's First Luxury Card Maker", body:"We pioneered the luxury business card space in Nigeria — introducing finishes, materials, and NFC technology that the market had never seen before." },
  { icon:'📲', title:'NFC & QR Smart Technology', body:'Every card can be embedded with an NFC chip and a unique QR code — tap or scan to instantly share contact info, social profiles, and business links.' },
  { icon:'🎨', title:'Bespoke Design Studio', body:'Our in-house design team crafts cards that are an extension of your brand identity — from color theory to typography to finish selection.' },
  { icon:'⚡', title:'Fast Turnaround', body:'From design approval to delivery, our streamlined production process ensures your cards are ready faster than any competitor without sacrificing quality.' },
  { icon:'🔐', title:'Secure ID Integration', body:'Staff ID cards are tied to digital profiles with QR-coded identity verification, role-based access, and admin-controlled permissions.' },
  { icon:'🌍', title:'Serving Clients Across Africa', body:'From Lagos to Abuja, Accra to Nairobi — Xtreme Cardz ships premium cards across Africa with full tracking and secure packaging.' },
];

const process = [
  { step:'01', title:'Consultation', body:'We discuss your brand, goals, and the impression you want to make. We recommend the right material and finish for your use case.' },
  { step:'02', title:'Design', body:'Our designers create your card artwork — logo placement, typography, color grading, and finish-specific optimizations.' },
  { step:'03', title:'Approval', body:"You review a digital proof. We refine until it's perfect. No card goes to print without your sign-off." },
  { step:'04', title:'Production', body:'Cards are printed, laminated, cut, and — where applicable — NFC chips are embedded and QR codes are programmed.' },
  { step:'05', title:'Delivery', body:'Packaged securely and dispatched. You receive your cards ready to make an impression from day one.' },
];

const faqs = [
  { q:'What is an NFC business card?', a:'An NFC (Near Field Communication) card contains a tiny chip that transmits data wirelessly when tapped against a smartphone. One tap shares your contact, social profiles, website, or any link — no app needed.' },
  { q:'Can I order a single card?', a:'Yes. We cater to individuals, small businesses, and large corporates. Whether you need 1 card or 10,000, we deliver the same quality.' },
  { q:'How long does production take?', a:'Standard orders are completed in 3–5 business days. Rush orders can be arranged. Metal and bamboo cards may take slightly longer due to the engraving process.' },
  { q:'Do you offer bulk discounts?', a:'Absolutely. Pricing scales with quantity. Contact us for a custom quote on orders of 50+ cards.' },
  { q:'Can I get a card with my company logo and staff photo?', a:'Yes — our staff ID cards support full-color printing including logos, photos, QR codes, and department information.' },
  { q:'What materials are available?', a:'We offer 4 plastic finishes (Eggshell, Nubis, Translux, Classic Lustre), stainless steel metal cards, and real bamboo veneer cards.' },
];

const TABS = ['Overview', 'Materials', 'Our Work', 'Why Us', 'Process', 'How to Use', 'FAQ'];
const TAG_COLORS = { Business:'#6366f1', NFC:'#0ea5e9', Maintenance:'#f59e0b', COD:'#10b981' };

export default function CardSamples() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [tagFilter, setTagFilter] = useState('All');
  const [materialModal, setMaterialModal] = useState(null);
  const [sampleModal, setSampleModal] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tags = ['All', ...Object.keys(TAG_COLORS)];
  const filteredSamples = tagFilter === 'All' ? samples : samples.filter(s => s.tag === tagFilter);

  return (
    <div style={S.page}>
      <div style={S.goBackRow}>
        <button style={S.goBackBtn} onClick={() => navigate(-1)}>← Go back</button>
      </div>
      {/* ── HERO ── */}
      <div style={S.hero}>
        <div style={S.heroNoise} />
        <div style={S.heroContent}>
          <div style={S.heroBadge}>✦ XTREME CR8IVITY</div>
          <h1 style={S.heroTitle}>Cards That<br /><span style={S.heroAccent}>Command Attention</span></h1>
          <p style={S.heroSub}>Premium plastic, metal & bamboo cards — NFC-enabled, bespoke-designed, Africa-delivered.</p>
          <div style={S.heroStats}>
            {[['6+','Materials'],['10K+','Cards Delivered'],['5','African Countries'],['48h','Avg Turnaround']].map(([n,l]) => (
              <div key={l} style={S.statItem}>
                <span style={S.statNum}>{n}</span>
                <span style={S.statLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={S.heroGlow} />
      </div>

      {/* ── TABS ── */}
      <div style={S.tabBar}>
        {TABS.map(t => (
          <button key={t} style={{ ...S.tab, ...(activeTab === t ? S.tabActive : {}) }} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div style={S.body}>

        {/* ── OVERVIEW ── */}
        {activeTab === 'Overview' && (
          <div>
            <div style={S.sectionLabel}>What We Do</div>
            <div style={S.overviewGrid}>
              {[
                { icon:'💎', title:'Luxury Finishes', desc:'6 premium materials from soft-touch Nubis to transparent Translux — each finish tells a different story.' },
                { icon:'📡', title:'NFC Smart Cards', desc:'Tap-to-share technology embedded in any card. One tap, instant digital profile.' },
                { icon:'🪪', title:'Staff ID Cards', desc:'QR-coded, role-linked, admin-managed identity cards for your entire workforce.' },
                { icon:'🎯', title:'COD & Maintenance', desc:'Specialized operational cards for field teams — durable, branded, functional.' },
                { icon:'🌿', title:'Eco Options', desc:'Real bamboo veneer cards for brands that care about sustainability as much as style.' },
                { icon:'🔩', title:'Metal Cards', desc:'Stainless steel with laser engraving. The card that never gets thrown away.' },
              ].map(f => (
                <div key={f.title} style={S.featureCard}>
                  <div style={S.featureIcon}>{f.icon}</div>
                  <div style={S.featureTitle}>{f.title}</div>
                  <div style={S.featureDesc}>{f.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ ...S.sectionLabel, marginTop: 48 }}>A Glimpse of Our Work</div>
            <div style={S.previewStrip}>
              {samples.slice(0, 5).map(s => (
                <div key={s.id} style={S.previewThumb} onClick={() => { setActiveTab('Our Work'); }}>
                  <img src={s.image} alt={s.title} style={S.previewImg} />
                  <div style={S.previewOverlay}><span style={{ ...S.tagChip, background: TAG_COLORS[s.tag] || '#6366f1' }}>{s.tag}</span></div>
                </div>
              ))}
            </div>

            <div style={S.ctaBanner}>
              <div>
                <div style={S.ctaTitle}>Ready to make your mark?</div>
                <div style={S.ctaSub}>Browse our full catalogue or contact us for a custom quote.</div>
              </div>
              <a href="https://xtremecardz.com" target="_blank" rel="noopener noreferrer" style={S.ctaBtn}>View Our Work →</a>
            </div>
          </div>
        )}

        {/* ── MATERIALS ── */}
        {activeTab === 'Materials' && (
          <div>
            <div style={S.sectionLabel}>Our Materials</div>
            <div style={S.materialsGrid}>
              {materials.map(m => (
                <div key={m.id} style={{ ...S.matCard, '--accent': m.accent }}
                  onMouseEnter={() => setHoveredCard(m.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => setMaterialModal(m)}>
                  <div style={S.matImgWrap}>
                    {m.photo
                      ? <img src={m.photo} alt={m.name} style={S.matImg} />
                      : <div style={{ ...S.matSwatch, background: m.swatch }} />}
                    <div style={{ ...S.matBadge, background: m.badgeBg, color: m.badgeColor }}>{m.badge}</div>
                  </div>
                  <div style={S.matBody}>
                    <div style={{ ...S.matName, color: m.accent }}>{m.name}</div>
                    <div style={S.matTagline}>{m.tagline}</div>
                    <div style={S.matDesc}>{m.description.slice(0, 90)}…</div>
                    <div style={S.matLearn}>View Details →</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── OUR WORK ── */}
        {activeTab === 'Our Work' && (
          <div>
            <div style={S.sectionLabel}>Our Portfolio</div>
            <div style={S.filterRow}>
              {['All', 'Business', 'NFC', 'Maintenance', 'COD'].map(t => (
                <button key={t} style={{ ...S.filterBtn, ...(tagFilter === t ? { ...S.filterBtnActive, background: TAG_COLORS[t] || '#6366f1' } : {}) }}
                  onClick={() => setTagFilter(t)}>{t}</button>
              ))}
            </div>

            {/* Featured Section for Duplex */}
            {tagFilter === 'All' && (
              <div style={{ marginBottom: 60 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#f9fafb', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 4, height: 28, background: '#6366f1', borderRadius: 2 }} />
                  Premium Duplex Showcase
                </div>
                <p style={{ color: '#9ca3af', fontSize: 15, lineHeight: 1.6, marginBottom: 24, maxWidth: 800 }}>
                  A <strong>Duplex Card</strong> is the perfect combination of both an <strong>ID card</strong> and a <strong>Business card</strong>. 
                  Designed for modern professionals, it features your official identity on one side and your premium networking details on the other — 
                  all crafted with our signature luxury finishes.
                </p>
                
                <div style={{ ...S.samplesGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
                  {[
                    { name: 'Classic Lustre', video: videoClassicLustre, desc: 'High-gloss vibrant finish' },
                    { name: 'Egg Shell', video: videoEggShell, desc: 'Subtle textured premium feel' },
                    { name: 'Translux', video: videoTranslux, desc: 'Transparent see-through elegance' },
                    { name: 'Nubix', video: videoNubix, desc: 'Velvety soft-touch luxury' },
                  ].map(v => (
                    <div key={v.name} style={{ ...S.sampleCard, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', borderRadius: 20, overflow: 'hidden' }}>
                      <div style={{ height: 200, background: '#000', position: 'relative', overflow: 'hidden' }}>
                        {v.video ? (
                          <video 
                            key={v.video}
                            autoPlay 
                            muted 
                            loop 
                            playsInline 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, display: 'block' }}
                          >
                            <source src={v.video} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12 }}>
                            Video not available
                          </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, color: 'white' }}>
                          {v.name} Finish
                        </div>
                      </div>
                      <div style={{ padding: 20 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#f9fafb', marginBottom: 4 }}>Duplex: {v.name} Edition</div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>{v.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={S.samplesGrid}>
              {filteredSamples.filter(s => !s.isDuplex).map(s => (
                <div key={s.id} style={S.sampleCard} onClick={() => setSampleModal(s)}>
                  <div style={S.sampleImgWrap}>
                    <img src={s.image} alt={s.title} style={S.sampleImg} />
                    <div style={S.sampleOverlay}>
                      <span style={S.sampleZoom}>🔍 View</span>
                    </div>
                  </div>
                  <div style={S.sampleInfo}>
                    <span style={{ ...S.tagChip, background: TAG_COLORS[s.tag] || '#6366f1' }}>{s.tag}</span>
                    <div style={S.sampleTitle}>{s.title}</div>
                    <div style={S.sampleSub}>{s.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WHY US ── */}
        {activeTab === 'Why Us' && (
          <div>
            <div style={S.sectionLabel}>Why Xtreme Cardz</div>
            <div style={S.whyGrid}>
              {whyUs.map(w => (
                <div key={w.title} style={S.whyCard}>
                  <div style={S.whyIcon}>{w.icon}</div>
                  <div style={S.whyTitle}>{w.title}</div>
                  <div style={S.whyBody}>{w.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROCESS ── */}
        {activeTab === 'Process' && (
          <div>
            <div style={S.sectionLabel}>How It Works</div>
            <div style={S.processTrack}>
              {process.map((p, i) => (
                <div key={p.step} style={S.processStep}>
                  <div style={S.processLeft}>
                    <div style={S.processNum}>{p.step}</div>
                    {i < process.length - 1 && <div style={S.processLine} />}
                  </div>
                  <div style={S.processRight}>
                    <div style={S.processTitle}>{p.title}</div>
                    <div style={S.processBody}>{p.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HOW TO USE ── */}
        {activeTab === 'How to Use' && (
          <div style={{ animation: 'fadeUp 0.4s ease-out' }}>
            <div style={S.sectionLabel}>Tutorial & Features</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 40, alignItems: 'start' }}>
              {/* Video Section */}
              <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                <div style={{ padding: '24px 28px', borderBottom: '1px solid #1f2937', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f9fafb' }}>How to Use Our Cards</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>A quick guide to sharing your digital profile</div>
                </div>
                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                  {videoHowToUse ? (
                    <video 
                      controls 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    >
                      <source src={videoHowToUse} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                      Video tutorial not available
                    </div>
                  )}
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📱</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f9fafb' }}>Works with iPhone & Android</div>
                  </div>
                  <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>
                    Our smart cards are designed for instant connectivity. Watch the video to see how seamless networking can be with Xtreme Cardz.
                  </p>
                </div>
              </div>

              {/* Explanations Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* NFC Feature */}
                <div style={{ background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 32 }}>📡</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1 }}>Contactless Sharing</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#f9fafb' }}>Tap and Share (NFC)</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7 }}>
                    <strong>NFC</strong> stands for <strong>Near Field Communication</strong>. It is a specialized wireless technology that allows two devices to communicate when they are close together.
                  </p>
                  <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7, marginTop: 12 }}>
                    Every Xtreme Card is embedded with a high-performance NFC chip. Simply tap your card against the back of any NFC-enabled smartphone to instantly share your digital profile, contact details, and social links. 
                    <strong> No apps or downloads required.</strong>
                  </p>
                </div>

                {/* QR Feature */}
                <div style={{ background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 32 }}>🔍</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: 1 }}>Universal Compatibility</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#f9fafb' }}>QR Code Scanning</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7 }}>
                    <strong>QR</strong> stands for <strong>Quick Response</strong>. For older devices or in situations where tapping isn't preferred, every card features a unique, high-resolution QR code.
                  </p>
                  <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7, marginTop: 12 }}>
                    Anyone can open their smartphone camera, point it at the QR code on your card, and instantly be redirected to your digital profile. It's a foolproof way to ensure you can connect with 100% of the people you meet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FAQ ── */}
        {activeTab === 'FAQ' && (
          <div>
            <div style={S.sectionLabel}>Frequently Asked</div>
            <div style={S.faqList}>
              {faqs.map((f, i) => (
                <div key={i} style={S.faqItem} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div style={S.faqQ}>
                    <span>{f.q}</span>
                    <span style={{ ...S.faqChevron, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                  </div>
                  {openFaq === i && <div style={S.faqA}>{f.a}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MATERIAL MODAL ── */}
      {materialModal && (
        <div style={S.modalOverlay} onClick={() => setMaterialModal(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <button style={S.modalClose} onClick={() => setMaterialModal(null)}>✕</button>
            {materialModal.photo
              ? <img src={materialModal.photo} alt={materialModal.name} style={S.modalImg} />
              : <div style={{ ...S.modalImg, background: materialModal.swatch, borderRadius: 12 }} />}
            <div style={{ ...S.matName, color: materialModal.accent, fontSize: 22, marginTop: 16 }}>{materialModal.name}</div>
            <div style={S.matTagline}>{materialModal.tagline}</div>
            <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.7, margin: '12px 0' }}>{materialModal.description}</p>
            <div style={S.modalSection}>Specifications</div>
            <ul style={S.specList}>{materialModal.specs.map(s => <li key={s} style={S.specItem}>✓ {s}</li>)}</ul>
            <div style={S.modalSection}>Best For</div>
            <div style={{ display:'flex', gap: 8, flexWrap:'wrap', marginTop: 8 }}>
              {materialModal.bestFor.map(b => <span key={b} style={{ ...S.tagChip, background:'#1f2937', color:'#d1d5db', border:'1px solid #374151' }}>{b}</span>)}
            </div>
          </div>
        </div>
      )}

      {/* ── SAMPLE MODAL ── */}
      {sampleModal && (
        <div style={S.modalOverlay} onClick={() => setSampleModal(null)}>
          <div style={{ ...S.modal, maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <button style={S.modalClose} onClick={() => setSampleModal(null)}>✕</button>
            <div style={S.modalMainImg}>
              <img src={sampleModal.image} alt={sampleModal.title} style={{ ...S.modalImg, objectFit:'contain', background:'#111' }} />
            </div>
            
            {sampleModal.gallery && sampleModal.gallery.length > 0 && (
              <div style={S.modalGallery}>
                <div style={S.modalSection}>More Views</div>
                <div style={S.galleryGrid}>
                  {sampleModal.gallery.map((img, idx) => (
                    <img key={idx} src={img} alt={`${sampleModal.title} view ${idx + 1}`} style={S.galleryItem} onClick={() => setSampleModal({ ...sampleModal, image: img })} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ display:'flex', alignItems:'center', gap: 10, marginTop: 16 }}>
              <span style={{ ...S.tagChip, background: TAG_COLORS[sampleModal.tag] || '#6366f1' }}>{sampleModal.tag}</span>
              <span style={{ color:'#9ca3af', fontSize: 13 }}>{sampleModal.subtitle}</span>
            </div>
            <div style={{ ...S.matName, color:'#f9fafb', fontSize: 24, marginTop: 8 }}>{sampleModal.title}</div>
            <div style={{ color:'#6b7280', fontSize: 14, marginTop: 4 }}>
              Material: <span style={{ color:'#d1d5db' }}>{materials.find(m => m.id === sampleModal.material)?.name || sampleModal.material}</span>
            </div>
            {sampleModal.isDuplex && (
              <div style={{ marginTop: 16, padding: 16, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12 }}>
                <div style={{ color: '#6366f1', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Card Feature</div>
                <div style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.6 }}>This premium Duplex card features a double-layered construction with our signature <span style={{ color: '#34d399', fontWeight: 600 }}>Classic Lustre</span> finish on one side and a complementary texture on the other.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page: { background: '#0a0a0a', minHeight: '100vh', color: '#f9fafb', fontFamily: "'Inter', sans-serif" },
  goBackRow: { padding: '16px 32px 0', maxWidth: 1100, margin: '0 auto' },
  goBackBtn: { padding: '8px 14px', borderRadius: 10, border: '1px solid #1f2937', background: '#0d0d0d', color: '#e5e7eb', cursor: 'pointer', fontSize: 13, fontWeight: 700 },

  // Hero
  hero: { position: 'relative', padding: '72px 40px 60px', overflow: 'hidden', background: 'linear-gradient(160deg, #0f0f0f 0%, #111827 60%, #0a0a0a 100%)', borderBottom: '1px solid #1f2937' },
  heroNoise: { position: 'absolute', inset: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")', opacity: 0.4, pointerEvents: 'none' },
  heroGlow: { position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' },
  heroContent: { position: 'relative', zIndex: 1, maxWidth: 700 },
  heroBadge: { display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: '#6366f1', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '4px 14px', marginBottom: 20 },
  heroTitle: { fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-1px', color: '#f9fafb' },
  heroAccent: { background: 'linear-gradient(90deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { fontSize: 16, color: '#9ca3af', lineHeight: 1.7, maxWidth: 520, margin: '0 0 36px' },
  heroStats: { display: 'flex', gap: 32, flexWrap: 'wrap' },
  statItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  statNum: { fontSize: 28, fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.5px' },
  statLabel: { fontSize: 12, color: '#6b7280', fontWeight: 500, letterSpacing: '0.5px' },

  // Tabs
  tabBar: { display: 'flex', gap: 0, borderBottom: '1px solid #1f2937', background: '#0d0d0d', overflowX: 'auto', padding: '0 24px' },
  tab: { padding: '14px 20px', background: 'none', border: 'none', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderBottom: '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap', letterSpacing: '0.3px' },
  tabActive: { color: '#6366f1', borderBottomColor: '#6366f1' },

  // Body
  body: { padding: '40px 32px', maxWidth: 1100, margin: '0 auto' },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: '#6366f1', textTransform: 'uppercase', marginBottom: 28 },

  // Overview
  overviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 },
  featureCard: { background: '#111827', border: '1px solid #1f2937', borderRadius: 16, padding: '28px 24px', transition: 'border-color 0.2s' },
  featureIcon: { fontSize: 28, marginBottom: 14 },
  featureTitle: { fontSize: 15, fontWeight: 700, color: '#f9fafb', marginBottom: 8 },
  featureDesc: { fontSize: 13, color: '#9ca3af', lineHeight: 1.65 },
  previewStrip: { display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 },
  previewThumb: { position: 'relative', flexShrink: 0, width: 160, height: 100, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: '1px solid #1f2937' },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  previewOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'flex-end', padding: 8 },
  ctaBanner: { marginTop: 48, background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid #4338ca', borderRadius: 20, padding: '32px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' },
  ctaTitle: { fontSize: 20, fontWeight: 700, color: '#f9fafb', marginBottom: 6 },
  ctaSub: { fontSize: 14, color: '#a5b4fc' },
  ctaBtn: { background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },

  // Materials
  materialsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 },
  matCard: { background: '#111827', border: '1px solid #1f2937', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' },
  matImgWrap: { position: 'relative', height: 180, overflow: 'hidden' },
  matImg: { width: '100%', height: '100%', objectFit: 'cover' },
  matSwatch: { width: '100%', height: '100%' },
  matBadge: { position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.5px' },
  matBody: { padding: '20px 20px 24px' },
  matName: { fontSize: 18, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.3px' },
  matTagline: { fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 10, letterSpacing: '0.3px' },
  matDesc: { fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 14 },
  matLearn: { fontSize: 12, color: '#6366f1', fontWeight: 700, letterSpacing: '0.5px' },

  // Samples
  filterRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 },
  filterBtn: { padding: '7px 16px', borderRadius: 20, border: '1px solid #374151', background: 'transparent', color: '#9ca3af', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  filterBtnActive: { color: 'white', border: '1px solid transparent' },
  samplesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 },
  sampleCard: { background: '#111827', border: '1px solid #1f2937', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' },
  sampleImgWrap: { position: 'relative', height: 150, overflow: 'hidden' },
  sampleImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  sampleOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' },
  sampleZoom: { color: 'white', fontSize: 13, fontWeight: 700, opacity: 0, transition: 'opacity 0.2s' },
  sampleInfo: { padding: '14px 16px 18px' },
  sampleTitle: { fontSize: 14, fontWeight: 700, color: '#f9fafb', margin: '8px 0 4px' },
  sampleSub: { fontSize: 12, color: '#6b7280' },
  tagChip: { display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, color: 'white', letterSpacing: '0.5px' },

  // Why Us
  whyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  whyCard: { background: '#111827', border: '1px solid #1f2937', borderRadius: 16, padding: '28px 24px' },
  whyIcon: { fontSize: 32, marginBottom: 14 },
  whyTitle: { fontSize: 15, fontWeight: 700, color: '#f9fafb', marginBottom: 10 },
  whyBody: { fontSize: 13, color: '#9ca3af', lineHeight: 1.7 },

  // Process
  processTrack: { display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 640 },
  processStep: { display: 'flex', gap: 24 },
  processLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 },
  processNum: { width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white', flexShrink: 0 },
  processLine: { width: 2, flex: 1, background: 'linear-gradient(to bottom, #6366f1, #1f2937)', margin: '6px 0', minHeight: 40 },
  processRight: { paddingBottom: 40 },
  processTitle: { fontSize: 17, fontWeight: 700, color: '#f9fafb', marginBottom: 8, marginTop: 10 },
  processBody: { fontSize: 13, color: '#9ca3af', lineHeight: 1.7 },

  // FAQ
  faqList: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 },
  faqItem: { background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '18px 20px', cursor: 'pointer', transition: 'border-color 0.2s' },
  faqQ: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 600, color: '#f9fafb', gap: 12 },
  faqChevron: { fontSize: 18, color: '#6366f1', transition: 'transform 0.2s', flexShrink: 0 },
  faqA: { marginTop: 14, fontSize: 13, color: '#9ca3af', lineHeight: 1.75, borderTop: '1px solid #1f2937', paddingTop: 14 },

  // Modal
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: '#111827', border: '1px solid #1f2937', borderRadius: 20, padding: 28, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
  modalClose: { position: 'absolute', top: 16, right: 16, background: '#1f2937', border: 'none', color: '#9ca3af', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalImg: { width: '100%', height: 220, objectFit: 'cover', borderRadius: 12 },
  modalSection: { fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: '#6366f1', textTransform: 'uppercase', marginTop: 20, marginBottom: 10 },
  specList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  specItem: { fontSize: 13, color: '#d1d5db', display: 'flex', alignItems: 'center', gap: 8 },
  modalMainImg: { borderRadius: 12, overflow: 'hidden', border: '1px solid #1f2937' },
  modalGallery: { marginTop: 16 },
  galleryGrid: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 },
  galleryItem: { width: 80, height: 60, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: '2px solid #1f2937', transition: 'border-color 0.2s', ':hover': { borderColor: '#6366f1' } },
};
