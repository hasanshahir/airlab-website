import teamData from './team.json';
import previousInternsData from './previous_interns.json';
import grantsData from './grants.json';
import sponsorsData from './sponsors.json';
import projectsData from './projects.json';
import publicationsData from './publications.json';
import type {
  Grant,
  Sponsor,
  ProjectItem,
  TeamMemberData,
  PublicationItem,
} from '../types/data';

export interface GalleryImageRecord {
  id: string;
  src: string;
  caption: string;
  category: string;
  date?: string;
}

export interface PerformerRecord {
  id: string;
  name: string;
  role: string;
  month: string;
  image?: string;
  achievement?: string;
  project?: string;
  description?: string;
}

export interface CollaborationRecord {
  id: string;
  name: string;
  type: string;
  location?: string;
  logo?: string;
  website?: string;
  description: string;
}

export interface LabBlogRecord {
  code: string;
  date: string;
  title: string;
  author: string;
  readTime: string;
  summary: string;
  category: string;
}

export interface LabFacilityRecord {
  code: string;
  unit: string;
  spec: string;
  detail: string;
  metrics: string;
}

export interface ResearchAreaRecord {
  code: string;
  title: string;
  status: string;
  metric: string;
  summary: string;
  stack: string[];
  to: string;
}

export interface RecentUpdateRecord {
  code: string;
  category: string;
  date: string;
  title: string;
  summary: string;
  department: string;
  ctaLabel: string;
  isApply?: boolean;
  to: string;
}

export const SPIRAL_DOMAIN_STRING =
  'ARTIFICIAL INTELLIGENCE RESEARCH LAB // WHERE INTELLIGENCE MEETS ENGINEERING // COMPUTER VISION // LARGE LANGUAGE MODELS // ROBOTICS & AUTONOMOUS SYSTEMS // DEEP LEARNING // NED UNIVERSITY CSIT // ';

export const RECENT_UPDATES: RecentUpdateRecord[] = [
  {
    code: '[01.1]',
    category: 'BENCHMARK',
    date: '2026 // RELEASE',
    title: 'Urdu Multilingual LLM Pretraining & Low-Resource Tokenization Milestone',
    summary:
      'Pretraining byte-level tokenizers and parameter-efficient LoRA fine-tuning pipelines tailored for Pakistani regional dialects at the NED CSIT compute cluster.',
    department: 'NLP Research Track',
    ctaLabel: 'Explore Project',
    to: '/projects',
  },
  {
    code: '[01.2]',
    category: 'VACANCIES',
    date: 'ADMISSIONS OPEN',
    title: 'Student Research Fellowships & Undergraduate Internships Open',
    summary:
      'Funded fellowship positions open for graduate and undergraduate scholars in edge AI, visual odometry, medical imaging, and TinyML hardware acceleration.',
    department: 'Fellowships',
    ctaLabel: 'Apply for Vacancy',
    isApply: true,
    to: '/interns',
  },
  {
    code: '[01.3]',
    category: 'ROBOTICS',
    date: 'LAB BENCHMARK',
    title: 'Autonomous UAV Edge Perception & Visual Odometry Trial Completed',
    summary:
      'Field testing real-time visual odometry, obstacle avoidance, and neural inference algorithms on embedded NVIDIA Jetson computing hardware.',
    department: 'Robotics & Vision Lab',
    ctaLabel: 'View Benchmark',
    to: '/projects',
  },
  {
    code: '[01.4]',
    category: 'CLINICAL AI',
    date: 'HOSPITAL PILOT',
    title: 'Explainable Chest Radiography & Clinical Diagnostic Vision Evaluation',
    summary:
      'Multi-modal vision-language diagnostic models evaluated for automated radiological reporting and ocular disease screening with clinical partners.',
    department: 'Healthcare AI Track',
    ctaLabel: 'Read Publications',
    to: '/publications',
  },
  {
    code: '[01.5]',
    category: 'AGRI-AI',
    date: 'SATELLITE TELEMETRY',
    title: 'Multispectral Crop Yield & Early Wheat Rust Forecasting Pipeline',
    summary:
      'Spatiotemporal fusion of Sentinel-2 multispectral imagery and IoT soil probes across Sindh agricultural zones for early crop stress warnings.',
    department: 'Smart Agriculture Unit',
    ctaLabel: 'Explore Project',
    to: '/projects',
  },
];

export const CORE_RESEARCH_AREAS: ResearchAreaRecord[] = [
  {
    code: '[02.1]',
    title: 'Computer Vision & Medical Diagnostics',
    status: 'ACTIVE CLINICAL PILOTS',
    metric: '08 BENCHMARKS',
    summary:
      'High-resolution retinal OCT segmentation, chest radiograph pathology localization, and automated industrial defect inspection under constrained clinical compute.',
    stack: ['PyTorch', 'MONAI', 'DICOM', 'Explainable ViTs'],
    to: '/projects',
  },
  {
    code: '[02.2]',
    title: 'Multilingual NLP & Sovereign LLMs',
    status: 'URDU & SINDHI CORPORA',
    metric: '38% TOKEN REDUCTION',
    summary:
      'Domain-specific large language models, byte-level BPE tokenizers, neural machine translation, and acoustic speech recognition for South Asian languages.',
    stack: ['Transformers', 'LoRA / QLoRA', 'Custom BPE', 'vLLM'],
    to: '/projects',
  },
  {
    code: '[02.3]',
    title: 'Autonomous Robotics & UAV Navigation',
    status: 'REAL-TIME EDGE SLAM',
    metric: '30+ FPS ONBOARD',
    summary:
      'GPS-denied visual-inertial odometry, multi-agent drone coordination, and ROS2 sensor fusion for field inspection and autonomous navigation.',
    stack: ['ROS2', 'Jetson Orin', 'Stereo VIO', 'LiDAR Fusion'],
    to: '/projects',
  },
  {
    code: '[02.4]',
    title: 'TinyML, FPGA & Edge AI Acceleration',
    status: 'SUB-5W INFERENCE',
    metric: 'INT8 / FP16 DETERMINISTIC',
    summary:
      'Quantization-aware training, neural architecture search, and hardware-software co-design on NVIDIA Jetson, Xilinx FPGA, and RISC-V microcontrollers.',
    stack: ['TensorRT', 'ONNX Runtime', 'Vitis AI', 'C++17'],
    to: '/projects',
  },
  {
    code: '[02.5]',
    title: 'Smart Agriculture & Climate Telemetry',
    status: 'SINDH FIELD TRIALS',
    metric: '14-DAY LEAD FORECAST',
    summary:
      'Fusing multispectral satellite observations with edge IoT sensor networks for precision irrigation, pest detection, and national crop yield modeling.',
    stack: ['Sentinel-2', 'Spatiotemporal GNN', 'Edge IoT', 'GeoAI'],
    to: '/projects',
  },
  {
    code: '[02.6]',
    title: 'Smart Cities & Intelligent Transportation',
    status: 'KARACHI CORRIDOR ANALYTICS',
    metric: 'MULTI-CAMERA TRACKING',
    summary:
      'Real-time urban traffic flow optimization, ANPR license plate recognition, and multi-camera vehicle re-identification for metropolitan infrastructure.',
    stack: ['YOLOv8/v10', 'DeepSORT', 'Edge Streams', 'OpenCV'],
    to: '/projects',
  },
];

export const LAB_BLOGS: LabBlogRecord[] = [
  {
    code: '[BLG.01]',
    date: '2026 // TECHNICAL DISPATCH',
    category: 'NLP & TOKENIZATION',
    title: 'Byte-Level BPE Tokenization for Code-Switched Urdu and Roman-Urdu Corpora',
    author: 'AIR Lab NLP Research Group',
    readTime: '07 MIN READ',
    summary:
      'Why standard multilingual tokenizers fragment South Asian scripts and how our custom vocabulary compression reduces sequence length by 38% during LoRA fine-tuning.',
  },
  {
    code: '[BLG.02]',
    date: '2026 // EDGE SYSTEMS NOTE',
    category: 'ROBOTICS & TENSORRT',
    title: 'Deterministic INT8 TensorRT Deployment for UAV Visual Odometry on Jetson Orin',
    author: 'AIR Lab Robotics & Vision Track',
    readTime: '09 MIN READ',
    summary:
      'Profiling end-to-end latency from stereo camera capture to pose estimation under strict 12W power envelopes during outdoor flight tests at NED Campus.',
  },
  {
    code: '[BLG.03]',
    date: '2025 // CLINICAL AI REPORT',
    category: 'MEDICAL IMAGING',
    title: 'Addressing Scanner Domain Shift in Pakistani Hospital Chest X-Ray Screening',
    author: 'AIR Lab Medical Diagnostics Team',
    readTime: '06 MIN READ',
    summary:
      'Lessons learned from validating multi-label thoracic pathology classifiers across heterogeneous radiography hardware and varying patient demographics.',
  },
  {
    code: '[BLG.04]',
    date: '2025 // AGRI-TELEMETRY',
    category: 'GEOSPATIAL AI',
    title: 'Fusing Sentinel-2 Multispectral Bands with Ground IoT Probes for Wheat Rust Alerts',
    author: 'AIR Lab Smart Agriculture Unit',
    readTime: '08 MIN READ',
    summary:
      'Building spatiotemporal graph neural networks that forecast crop stress 14 days ahead of visual symptom onset across Sindh agricultural districts.',
  },
];

export const LAB_FACILITIES: LabFacilityRecord[] = [
  {
    code: '[NODE.01]',
    unit: 'Multi-GPU Deep Learning Cluster',
    spec: 'NVIDIA RTX & Enterprise Tensor Core Workstations',
    metrics: 'MULTI-NODE DDP // FP16/BF16',
    detail:
      'Dedicated high-VRAM compute nodes supporting distributed PyTorch DDP, DeepSpeed, and LoRA fine-tuning workloads inside the Department of CSIT.',
  },
  {
    code: '[NODE.02]',
    unit: 'Edge AI & Embedded Prototyping Bench',
    spec: 'NVIDIA Jetson Orin / Xavier & Xilinx FPGA Kits',
    metrics: '5W – 40W POWER TELEMETRY',
    detail:
      'Hardware-in-the-loop testbeds for TensorRT quantization, ONNX runtime profiling, and deterministic real-time inference benchmarking.',
  },
  {
    code: '[NODE.03]',
    unit: 'Autonomous Aerial & Ground Robotics Arena',
    spec: 'Custom Quadrotors, LiDAR & Stereo Depth Rigs',
    metrics: 'ROS2 HUMBLE // VIO TESTBED',
    detail:
      'Equipped with Intel RealSense, optical flow sensors, and onboard flight controllers for indoor and outdoor GPS-denied SLAM trials.',
  },
  {
    code: '[NODE.04]',
    unit: 'Clinical Imaging & Annotation Vault',
    spec: 'DICOM Workstations & Curated Regional Datasets',
    metrics: 'EXPERT-VERIFIED CORPORA',
    detail:
      'High-resolution local medical and satellite datasets annotated in partnership with domain radiologists, ophthalmologists, and agronomists.',
  },
];

export const LAB_MANDATE_PILLARS = [
  {
    step: '[PILLAR.01]',
    code: '01 // INDIGENOUS FOUNDATION MODELS',
    title: 'Regional NLP, Speech & Sovereign Language Models',
    spec: 'URDU / SINDHI / CODE-SWITCHED CORPORA',
    description:
      'Developing custom byte-level tokenizers, instruction-tuned language models, and acoustic pipelines that preserve cultural and linguistic nuance across Pakistan.',
  },
  {
    step: '[PILLAR.02]',
    code: '02 // CLINICAL COMPUTER VISION',
    title: 'Explainable Diagnostic Vision & Healthcare Triage',
    spec: 'OCT / CHEST RADIOGRAPHY / HISTOPATHOLOGY',
    description:
      'Partnering with leading medical centers to validate explainable computer vision models for early screening of diabetic retinopathy, tuberculosis, and thoracic pathologies.',
  },
  {
    step: '[PILLAR.03]',
    code: '03 // AUTONOMOUS PERCEPTION & EDGE AI',
    title: 'Embedded Robotics, UAV Odometry & Climate Telemetry',
    spec: 'JETSON ORIN / FPGA / MULTISPECTRAL IOT',
    description:
      'Designing quantization-aware neural networks, GPS-denied visual-inertial navigation stacks, and satellite crop-health models that execute reliably in the field.',
  },
];

export const FELLOWSHIP_CURRICULUM = [
  {
    step: '[STAGE.01]',
    duration: 'WEEKS 01 – 03',
    title: 'Foundations, Literature Synthesis & Reproducibility',
    deliverable: 'Baseline Paper Reproduction & Clean PyTorch Repository',
    description:
      'Fellows are paired with a faculty principal investigator and senior research engineer. You will audit top-tier conference papers (CVPR, NeurIPS, ACL, ICRA), set up reproducible conda/Docker environments on the lab cluster, and replicate a baseline benchmark.',
  },
  {
    step: '[STAGE.02]',
    duration: 'WEEKS 04 – 08',
    title: 'Dataset Engineering, Model Architecture & Ablations',
    deliverable: 'Curated Regional Dataset & Systematic Ablation Ledger',
    description:
      'Design novel architectural modifications, loss functions, or quantization pipelines tailored to Pakistani clinical, agricultural, or linguistic datasets. Conduct rigorous ablation experiments logged with full telemetry.',
  },
  {
    step: '[STAGE.03]',
    duration: 'WEEKS 09 – 12',
    title: 'Edge Deployment, Hardware Validation & Manuscript Authorship',
    deliverable: 'Deployed Prototype & First-Author / Co-Author Submission',
    description:
      'Compile trained weights for field hardware (Jetson Orin, FPGA, or clinical web portal) and co-author a peer-reviewed manuscript or technical blog dispatch under faculty supervision.',
  },
];

export const FELLOWSHIP_TRACKS = [
  {
    code: '[TRK.01]',
    name: 'Multilingual NLP & Sovereign LLMs',
    stack: 'PyTorch, Transformers, Tokenization, Python',
    seats: '04 SEATS / CYCLE',
  },
  {
    code: '[TRK.02]',
    name: 'Medical Diagnostic Vision & Explainable AI',
    stack: 'OpenCV, MONAI / PyTorch Vision, CNNs & ViTs',
    seats: '04 SEATS / CYCLE',
  },
  {
    code: '[TRK.03]',
    name: 'Autonomous Robotics, SLAM & UAV Control',
    stack: 'ROS2, C++/Python, Sensor Fusion, Linux',
    seats: '03 SEATS / CYCLE',
  },
  {
    code: '[TRK.04]',
    name: 'TinyML, Embedded Edge & FPGA Acceleration',
    stack: 'TensorRT, ONNX, C/C++, Quantization',
    seats: '03 SEATS / CYCLE',
  },
];

export function getTeamMembers(): TeamMemberData[] {
  return teamData as TeamMemberData[];
}

export function getFacultyMembers(): TeamMemberData[] {
  return getTeamMembers().filter((m) => m.category === 'Faculty');
}

export function getActiveInterns(): TeamMemberData[] {
  return getTeamMembers().filter(
    (m) =>
      m.category === 'Research Interns' ||
      m.category === 'Undergraduate' ||
      m.category === 'Postgraduate'
  );
}

export function getPreviousInterns(): Record<string, unknown>[] {
  return previousInternsData as Record<string, unknown>[];
}

export function getAlumniMembers(): TeamMemberData[] {
  const allMembers = getTeamMembers();
  const fromTeam = allMembers.filter((m) => m.category === 'Alumni');
  if (fromTeam.length > 0) return fromTeam;
  return getPreviousInterns().map((item: Record<string, unknown>, idx: number) => ({
    id: String(item.id || `past-${idx}`),
    name: String(item.name || 'Past Fellow'),
    role: String(item.role || item.project || 'Past Research Intern'),
    designation: item.designation ? String(item.designation) : undefined,
    category: 'Alumni' as const,
    image: String(item.image || ''),
    department: String(item.department || item.batch || 'NED University'),
    researchFocus: String(item.researchFocus || item.project || ''),
    tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
    linkedin: item.linkedin ? String(item.linkedin) : undefined,
    email: item.email ? String(item.email) : undefined,
    cvUrl: item.cvUrl ? String(item.cvUrl) : undefined,
  }));
}

export function getGrants(): Grant[] {
  // Strict descending recency sorting
  return [...(grantsData as Grant[])].sort((a, b) => {
    const yearA = parseInt(String(a.duration || '2025').match(/\d{4}/)?.[0] || '2025', 10);
    const yearB = parseInt(String(b.duration || '2025').match(/\d{4}/)?.[0] || '2025', 10);
    return yearB - yearA;
  });
}

export function getActiveGrants(): Grant[] {
  return getGrants().filter((g) => g.status === 'Active');
}

export function getSponsors(): Sponsor[] {
  return sponsorsData as Sponsor[];
}

export function getProjects(): ProjectItem[] {
  // Strict descending recency sorting
  return [...(projectsData as ProjectItem[])].sort((a, b) => {
    const yearA = parseInt(String(a.startDate || '2025').match(/\d{4}/)?.[0] || '2025', 10);
    const yearB = parseInt(String(b.startDate || '2025').match(/\d{4}/)?.[0] || '2025', 10);
    if (yearB !== yearA) return yearB - yearA;
    if (a.status === 'Ongoing' && b.status !== 'Ongoing') return -1;
    if (b.status === 'Ongoing' && a.status !== 'Ongoing') return 1;
    return 0;
  });
}

export function getOngoingProjects(): ProjectItem[] {
  return getProjects().filter((p) => p.status === 'Ongoing');
}

export function getFinishedProjects(): ProjectItem[] {
  return getProjects().filter((p) => p.status === 'Finished');
}

export function getPublications(): PublicationItem[] {
  // Strict descending recency sorting
  return [...(publicationsData as PublicationItem[])].sort(
    (a, b) => (Number(b.year) || 0) - (Number(a.year) || 0)
  );
}

export function getLabBlogs(): LabBlogRecord[] {
  return LAB_BLOGS;
}

export function getLabFacilities(): LabFacilityRecord[] {
  return LAB_FACILITIES;
}

export function getGalleryImages(): GalleryImageRecord[] {
  return [
    {
      id: 'slide-lab-1',
      src: '/carousel-images/6530466a-3815-4434-a181-85e97c3ae385.jpg',
      caption: 'Research & Prototyping Laboratory — High-Throughput Deep Learning Cluster',
      category: 'Laboratory',
      date: 'NED CSIT Lab',
    },
    {
      id: 'slide-gpu-2',
      src: '/carousel-images/6a392586-ef4f-41db-9be7-cee1a0018f1f.jpg',
      caption: 'Deep Learning GPU Compute — TensorRT & Edge Accelerated Nodes',
      category: 'Hardware & Compute',
      date: 'NED CSIT Lab',
    },
    {
      id: 'slide-collab-3',
      src: '/carousel-images/a4ddd83a-92b4-4c4a-abaa-fd36bff46d3b.jpg',
      caption: 'Student ML Collaboration — Foundational Models & Computer Vision',
      category: 'Research Fellows',
      date: 'NED CSIT Lab',
    },
    {
      id: 'slide-fellows-4',
      src: '/carousel-images/adc711cf-26d5-4a13-ac9f-4e29f0cf13d7.jpg',
      caption: 'Research Fellows Workstations — Pioneering Regional AI Breakthroughs',
      category: 'Research Fellows',
      date: 'NED CSIT Lab',
    },
    {
      id: 'slide-entrance-5',
      src: '/carousel-images/cb2f092f-f6df-418b-b84c-04085f274522.jpg',
      caption: 'Academic Excellence — Department of CSIT • NED University',
      category: 'Laboratory',
      date: 'NED Main Campus',
    },
  ];
}

export function getPerformers(): PerformerRecord[] {
  const members = getTeamMembers();
  const interns = members.filter(
    (m) =>
      m.category === 'Research Interns' ||
      m.category === 'Undergraduate' ||
      m.category === 'Postgraduate'
  );
  const base = interns.length > 0 ? interns.slice(0, 6) : members.slice(0, 6);
  const months = [
    'Current Cycle • Spotlight',
    'Previous Cycle • Benchmark Honor',
    'Research Milestone • Vision & NLP',
    'Hardware Deployment • Edge AI',
    'Publication Honor • Clinical AI',
    'Dataset Engineering • Regional AI',
  ];
  return base.map((m, idx) => ({
    id: String(m.id || `perf-${idx}`),
    name: m.name,
    role: m.designation || m.role || 'Research Fellow',
    month: months[idx % months.length],
    image: m.image,
    achievement: m.researchFocus || 'Excellence in Applied AI & Model Benchmarking',
    project: m.department || 'Department of CSIT, NED University',
    description:
      m.researchFocus ||
      'Recognized by the AIR Lab Faculty Evaluation Committee for technical rigor, reproducible model evaluation, and research engineering leadership.',
  }));
}

export function getCollaborations(): CollaborationRecord[] {
  const sponsors = getSponsors();
  return sponsors.map((s, idx) => ({
    id: String(s.id || `collab-${idx}`),
    name: s.name,
    type: s.tier || s.type || 'Institutional Partner',
    location: 'Pakistan / International R&D',
    logo: s.logo,
    website: s.url,
    description: `${
      s.type || 'Strategic research alliance'
    } collaborating with NED University AIR Lab on sponsored artificial intelligence benchmarks, dataset curation, and hardware deployment.`,
  }));
}

