// Higgsfield High-Fidelity Assets & Models Data

export const AI_MODELS = [
  {
    id: 'wan-3.0',
    name: 'Wan 3.0 Pro',
    creator: 'Alibaba AI & Higgsfield',
    badge: '1080p Cinema',
    badgeColor: 'cyan',
    desc: 'Cinematic physics, hyper-realistic fluid and lighting coherence.',
    aspects: ['16:9', '9:16', '1:1', '4:5'],
    costPerSec: 3,
    type: 'video'
  },
  {
    id: 'seedance-2.5',
    name: 'ByteDance Seedance 2.5',
    creator: 'ByteDance',
    badge: 'Fast Motion',
    badgeColor: 'purple',
    desc: 'High dynamics, action sequences, dynamic camera orbits & pan.',
    aspects: ['16:9', '9:16'],
    costPerSec: 2.5,
    type: 'video'
  },
  {
    id: 'kling-3.0',
    name: 'Kling 3.0 Ultra',
    creator: 'Kuaishou',
    badge: 'Hyper-Realism',
    badgeColor: 'amber',
    desc: 'World simulation, high fidelity human skin, cloth dynamics.',
    aspects: ['16:9', '9:16', '1:1'],
    costPerSec: 4,
    type: 'video'
  },
  {
    id: 'genjutsu-v1',
    name: 'Higgsfield Genjutsu v1.0',
    creator: 'Higgsfield Lab',
    badge: 'Motion Transfer',
    badgeColor: 'cyan',
    desc: 'Proprietary pose extraction & temporal identity retargeting.',
    aspects: ['9:16', '16:9', '1:1'],
    costPerSec: 3.5,
    type: 'motion'
  },
  {
    id: 'soul-v2',
    name: 'Higgsfield Soul v2',
    creator: 'Higgsfield Katana',
    badge: 'Human Identity',
    badgeColor: 'purple',
    desc: 'Zero-plastic human portraits, natural micro-expressions.',
    aspects: ['1:1', '9:16', '4:5'],
    costPerSec: 1.5,
    type: 'image'
  },
  {
    id: 'sora-2',
    name: 'Sora 2 / Veo 3.1',
    creator: 'OpenAI / Google',
    badge: 'Studio Master',
    badgeColor: 'amber',
    desc: 'Extended generation, complex narrative storyboarding.',
    aspects: ['16:9', '9:16'],
    costPerSec: 6,
    type: 'video'
  }
];

// Royalty-free high-production video clips for smooth playback
export const SAMPLE_VIDEOS = [
  {
    id: 'vid-cyberpunk',
    title: 'Neon Cyberpunk Runner',
    model: 'Wan 3.0 Pro',
    prompt: 'Cinematic wide shot, cybernetic protagonist sprint through Tokyo rain at night, volumetric neon fog, reflective puddle puddle splashes, anamorphic lens, 8k resolution',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-at-night-with-skyscrapers-and-neon-lights-40822-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    duration: '0:06',
    ratio: '16:9',
    views: '14.2k',
    likes: '1.8k'
  },
  {
    id: 'vid-fashion',
    title: 'Haute Couture Desert Walk',
    model: 'Higgsfield Soul v2',
    prompt: 'Slow motion 60fps tracking shot of female fashion model walking on white sand dunes in flowing emerald silk gown, golden hour wind physics',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-walking-in-a-desert-41514-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    duration: '0:08',
    ratio: '9:16',
    views: '28.9k',
    likes: '3.4k'
  },
  {
    id: 'vid-robotics',
    title: 'Bipedal Mech Assembly',
    model: 'ByteDance Seedance 2.5',
    prompt: 'Hyper-detailed macro 3D destruction and assembly of robotic titanium joints, sparking hydraulics, industrial factory lighting',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-lights-moving-along-motherboard-41527-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    duration: '0:05',
    ratio: '16:9',
    views: '9.6k',
    likes: '1.2k'
  },
  {
    id: 'vid-nature',
    title: 'Bioluminescent Ocean Leviathan',
    model: 'Kling 3.0 Ultra',
    prompt: 'Deep underwater documentary angle, giant mythical whale glowing with cyan bioluminescent patterns swimming through coral abyss, particulate water physics',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-diving-in-a-reef-with-many-corals-41603-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    duration: '0:07',
    ratio: '16:9',
    views: '41.1k',
    likes: '5.9k'
  }
];

export const AI_INFLUENCERS = [
  {
    id: 'inf-elena',
    name: 'Elena Vance',
    niche: 'Luxury Lifestyle & Tech',
    followers: '840K',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    voice: 'ElevenLabs - Serena (Sophisticated, Clear)',
    sampleScript: "I tested the new spatial computing headset for 7 days straight. Here is why Silicon Valley is keeping this quiet..."
  },
  {
    id: 'inf-marcus',
    name: 'Marcus Thorne',
    niche: 'Fintech & Productivity',
    followers: '1.2M',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
    voice: 'FishAudio - David (Deep, Trustworthy)',
    sampleScript: "Most founders waste 80% of their marketing budget on bad hooks. Here is the 3-step AI workflow that doubled our MRR."
  },
  {
    id: 'inf-chloe',
    name: 'Chloe Lin',
    niche: 'Fitness, AI & Wellness',
    followers: '620K',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
    voice: 'ElevenLabs - Rachel (Energetic, Natural)',
    sampleScript: "Stop doing cardio before weight training! 3 scientific reasons why this kills your recovery and metabolism."
  }
];

export const CAMERA_PRESETS = [
  'FPV Drone Orbit',
  'Crash Zoom 4K',
  'Low Angle Hero',
  'Dutch Angle 35mm',
  'Anamorphic Pan Right',
  'Slow Motion 120fps'
];

export const MCP_TOOLS_SPEC = [
  {
    name: 'higgsfield_generate_video',
    description: 'Generates ultra-high definition cinematic video using Wan 3.0 or Seedance.',
    parameters: {
      prompt: 'string (Detailed scene directive)',
      model: 'wan-3.0 | seedance-2.5 | kling-3.0',
      aspect_ratio: '16:9 | 9:16 | 1:1',
      duration: 'integer (5-10s)',
      camera_motion: 'orbit | zoom_in | pan_left'
    }
  },
  {
    name: 'higgsfield_motion_transfer',
    description: 'Extracts skeleton and facial dynamics from reference video and transfers onto target avatar.',
    parameters: {
      reference_video_url: 'string (URL of motion video)',
      target_image_url: 'string (URL of character avatar)',
      preserve_background: 'boolean',
      motion_strength: 'float (0.0 - 1.0)'
    }
  },
  {
    name: 'higgsfield_generate_ad_campaign',
    description: 'Autonomous AI CMO agent generates 3 viral video hooks and scripts for any product URL.',
    parameters: {
      product_url: 'string (E-commerce landing page)',
      target_audience: 'string',
      framework: 'problem_agitate | social_proof | curiosity_gap'
    }
  }
];
