import type { LucideIcon } from "lucide-react";
import {
  AtSignIcon,
  BadgeCheck,
  Blocks,
  Book,
  BookOpenCheck,
  Clock,
  Earth,
  Facebook,
  Github,
  Globe,
  Globe2,
  GraduationCap,
  HeartHandshake,
  HelpCircle,
  Home,
  Image,
  Instagram,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareText,
  RefreshCw,
  School,
  School2,
  Twitter,
  Users2,
  UserSearch,
  UserSquare2,
  VenetianMask,
} from "lucide-react";
import { v4 as uuid } from "uuid";

export const HEADER_HEIGHT = 72;

const CAMPUSES = [
  {
    id: 0,
    name: "Main Campus",
    slug: "main",
  },
];

const COLLEGES = [
  {
    id: 0,
    name: "College of Agriculture, Food, Environment and Natural Resources",
    slug: "cafenr",
    campus_id: 0,
  },
  {
    id: 1,
    name: "College of Arts and Sciences",
    slug: "cas",
    campus_id: 0,
  },
  {
    id: 2,
    name: "College of Criminal Justice",
    slug: "ccj",
    campus_id: 0,
  },
  {
    id: 3,
    name: "College of Education",
    slug: "ced",
    campus_id: 0,
  },
  {
    id: 4,
    name: "College of Economics, Management and Development Studies",
    slug: "cemds",
    campus_id: 0,
  },
  {
    id: 5,
    name: "College of Engineering and Information Technology",
    slug: "ceit",
    campus_id: 0,
  },
  {
    id: 6,
    name: "College of Nursing",
    slug: "con",
    campus_id: 0,
  },
  {
    id: 7,
    name: "College of Sports, Physical Education and Recreation",
    slug: "cspear",
    campus_id: 0,
  },
  {
    id: 8,
    name: "College of Veterinary Medicine and Biomedical Sciences",
    slug: "cvmbs",
    campus_id: 0,
  },
];

const PROGRAMS = [
  {
    name: "Bachelor of Science in Agriculture Major in Animal Science",
    slug: "bsa-as",
    college_id: 0,
  },
  {
    name: "Bachelor of Science in Agriculture Major in Crop Science",
    slug: "bsa-cs",
    college_id: 0,
  },
  {
    name: "Bachelor of Science in Environmental Science",
    slug: "bses",
    college_id: 0,
  },
  {
    name: "Bachelor of Science in Food Technology",
    slug: "bsft",
    college_id: 0,
  },
  {
    name: "Bachelor of Science in Land Use Design and Management",
    slug: "bsludm",
    college_id: 0,
  },
  {
    name: "Bachelor in Agricultural Entrepreneurship",
    slug: "bae",
    college_id: 0,
  },
  {
    name: "Bachelor of Science in Biology",
    slug: "bs-bio",
    college_id: 1,
  },
  {
    name: "Bachelor of Arts in English Language Studies",
    slug: "baels",
    college_id: 1,
  },
  {
    name: "Bachelor of Science in Psychology",
    slug: "bsp",
    college_id: 1,
  },
  {
    name: "Bachelor of Arts in Political Science",
    slug: "baps",
    college_id: 1,
  },
  {
    name: "Bachelor of Arts in Journalism",
    slug: "baj",
    college_id: 1,
  },
  {
    name: "Bachelor of Science in Social Work",
    slug: "bssw",
    college_id: 1,
  },
  {
    name: "Bachelor of Science in Applied Mathematics",
    slug: "bsam",
    college_id: 1,
  },
  {
    name: "Bachelor of Science in Criminology",
    slug: "bs-crim",
    college_id: 2,
  },
  {
    name: "Bachelor of Science in Industrial Security Management",
    slug: "bsism",
    college_id: 2,
  },
  {
    name: "Bachelor of Elementary Education",
    slug: "bee",
    college_id: 3,
  },
  {
    name: "Bachelor of Secondary Education - Major in English",
    slug: "bse-eng",
    college_id: 3,
  },
  {
    name: "Bachelor of Secondary Education - Major in Science",
    slug: "bse-sci",
    college_id: 3,
  },
  {
    name: "Bachelor of Secondary Education - Major in Filipino",
    slug: "bse-fil",
    college_id: 3,
  },
  {
    name: "Bachelor of Secondary Education - Major in Mathematics",
    slug: "bse-math",
    college_id: 3,
  },
  {
    name: "Bachelor of Secondary Education - Major in Social Science",
    slug: "bse-socsci",
    college_id: 3,
  },
  {
    name: "Bachelor of Science in Tourism Management",
    slug: "bstm",
    college_id: 3,
  },
  {
    name: "Bachelor of Early Childhood Education",
    slug: "bece",
    college_id: 3,
  },
  {
    name: "Bachelor of Special Needs Education",
    slug: "bsne",
    college_id: 3,
  },
  {
    name: "Bachelor of Technology and Livelihood Education",
    slug: "btle",
    college_id: 3,
  },
  {
    name: "Bachelor of Science in Hospitality Management",
    slug: "bshm",
    college_id: 3,
  },
  {
    name: "Bachelor of Science in Accountancy",
    slug: "bs-acc",
    college_id: 4,
  },
  {
    name: "Bachelor of Science in Business Management",
    slug: "bsbm",
    college_id: 4,
  },
  {
    name: "Bachelor of Science in Economics",
    slug: "bs-econ",
    college_id: 4,
  },
  {
    name: "Bachelor of Science in Development  Management",
    slug: "bsdm",
    college_id: 4,
  },
  {
    name: "Bachelor of Science in International Studies",
    slug: "bsis",
    college_id: 4,
  },
  {
    name: "Bachelor of Science in Office Administration",
    slug: "bsoa",
    college_id: 4,
  },
  {
    name: "Bachelor of Science in Agricultural and Biosystems Engineering",
    slug: "bsabe",
    college_id: 5,
  },
  {
    name: "Bachelor of Science in Architecture",
    slug: "bsarch",
    college_id: 5,
  },
  {
    name: "Bachelor of Science in Civil Engineering",
    slug: "bsce",
    college_id: 5,
  },
  {
    name: "Bachelor of Science in Computer Engineering",
    slug: "bscomp-eng",
    college_id: 5,
  },
  {
    name: "Bachelor of Science in Computer Science",
    slug: "bscs",
    college_id: 5,
  },
  {
    name: "Bachelor of Science in Electrical Engineering",
    slug: "bsee",
    college_id: 5,
  },
  {
    name: "Bachelor of Science in Electronics Engineering",
    slug: "bsece",
    college_id: 5,
  },
  {
    name: "Bachelor of Science in Industrial Engineering",
    slug: "bsie",
    college_id: 5,
  },
  {
    name: "Bachelor of Science in Industrial Technology Major in Automotive Technology",
    slug: "bsit-at",
    college_id: 5,
  },
  {
    name: "Bachelor of Science in Industrial Technology Major in Electrical Technology",
    slug: "bsit-et",
    college_id: 5,
  },
  {
    name: "Bachelor of Science in Industrial Technology Major in Electronics Technology",
    slug: "bsit-elex",
    college_id: 5,
  },
  {
    name: "Bachelor of Science in Information Technology",
    slug: "bsit",
    college_id: 5,
  },
  {
    name: "Bachelor of Science in Nursing",
    slug: "bsn",
    college_id: 6,
  },
  {
    name: "Bachelor of Science in Medical Technology",
    slug: "bsmt",
    college_id: 6,
  },
  {
    name: "Bachelor of Science in Midwifery",
    slug: "bsm",
    college_id: 6,
  },
  {
    name: "Bachelor of Physical Education",
    slug: "bped",
    college_id: 7,
  },
  {
    name: "Bachelor of Exercise and Sports Sciences",
    slug: "bsess",
    college_id: 7,
  },
  {
    name: "Doctor of Veterinary Medicine",
    slug: "dvm",
    college_id: 8,
  },
  {
    name: "Bachelor of Science in Veterinary Technology",
    slug: "bsvt",
    college_id: 8,
  },
  {
    name: "Bachelor of Science in  Animal Health and Management",
    slug: "bsahm",
    college_id: 8,
  },
  {
    name: "Bachelor of Science in Biomedical Science",
    slug: "bsbs",
    college_id: 8,
  },
];

export const SEED_DATA = CAMPUSES.map((campus) => {
  const campus_id = uuid();

  return {
    id: campus_id,
    name: campus.name,
    slug: campus.slug,

    colleges: COLLEGES.map((college) => {
      const college_id = uuid();

      return {
        id: college_id,
        name: college.name,
        slug: college.slug,
        campus_id,

        programs: PROGRAMS.filter(
          (program) => program.college_id === college.id,
        ).map((program) => {
          const program_id = uuid();

          return {
            id: program_id,
            name: program.name,
            slug: program.slug,
            college_id,
          };
        }),
      };
    }),
  };
});

export const POST_TYPE = [
  "following",
  "program",
  "college",
  "campus",
  "all",
] as const;

export const POST_TYPE_TABS: {
  id: (typeof POST_TYPE)[number];
  icon: LucideIcon;
  name: string;
}[] = [
  {
    id: "all",
    icon: Globe2,
    name: "All Campus",
  },
  {
    id: "campus",
    icon: School2,
    name: "My Campus",
  },
  {
    id: "college",
    icon: School,
    name: "My College",
  },
  {
    id: "program",
    icon: Book,
    name: "My Program",
  },
  {
    id: "following",
    icon: Users2,
    name: "Following",
  },
];

export const NAVBAR_LINKS = [
  {
    icon: Home,
    name: "Home",
    url: "/",
  },
  {
    icon: HeartHandshake,
    name: "Donate",
    url: "/donate",
  },
  {
    icon: HelpCircle,
    name: "About Kabsu.me",
    url: "/about",
    hasSeparator: true,
  },
  // {
  //   icon: Info,
  //   name: "CvSU Information Center",
  //   url: "/info",
  // },
  {
    icon: BookOpenCheck,
    name: "University Registrar",
    url: "https://registrar.cvsu.edu.ph/",
  },
  {
    icon: UserSquare2,
    name: "Student Portal",
    url: "https://myportal.cvsu.edu.ph/",
  },
  {
    icon: Blocks,
    name: "CvSU LMS",
    url: "https://elearning.cvsu.edu.ph/my/",
    hasSeparator: true,
  },
  {
    icon: GraduationCap,
    name: "Adventura 360° ",
    url: "https://adventura360.kabsu.me",
  },
  {
    icon: GraduationCap,
    name: "Arctec  ",
    url: "https://arctec.kabsu.me",
  },
  {
    icon: GraduationCap,
    name: "Odyssey",
    url: "https://odyssey.kabsu.me",
  },
  {
    icon: GraduationCap,
    name: "Swardify",
    url: "https://Swardify.kabsu.me",
  },
  {
    icon: GraduationCap,
    name: "Chromia ",
    url: "https://chromia.kabsu.me",
  },

  {
    icon: GraduationCap,
    name: "eBoto",
    url: "https://eboto.app",
  },
];

export const BLOCKED_USERNAMES = new Set([
  "brice",
  "bricesuazo",
  "cg",
  "about",
  "info",
  "cvsu",
  "signup",
  "notification",
  "notif",
  "notifs",
  "notifications",
  "post",
  "posts",
  "feed",
  "feeds",
  "home",
  "homes",
  "sign-up",
  "signin",
  "sign-in",
  "login",
  "log-in",
  "register",
  "registration",
  "auth",
  "authentication",
  "account",
  "accounts",
  "profile",
  "profiles",
  "me",
  "you",
  "admin",
  "administrator",
  "moderator",
  "mod",
  "support",
  "help",
  "info",
  "contact",
  "root",
  "sysadmin",
  "sys",
  "system",
  "donate",
  "privacy",
  "tos",
  "terms",
  "messages",
  "message",
  "chat",
  "chats",
  "reactivate",
  "ngl",
]);

export const NEW_FEATURES = [
  {
    index: 0,
    icon: MapPin,
    title: "Exclusive",
    description:
      "Access posts and chats exclusive to your campus, college, and program.",
  },
  {
    index: 1,
    icon: BadgeCheck,
    title: "Be Authentic",
    description:
      "Apply for Kabsu.me verification as an individual or organization.",
  },
  {
    index: 2,
    icon: Image,
    title: "Upload Photos",
    description: "Easily upload photos up to 5MB.",
  },
  {
    index: 3,
    icon: Clock,
    title: "Improved loading speed",
    description:
      "Kabsu.me ensures a faster and more efficient browsing experience.",
  },
  {
    index: 4,
    icon: Lock,
    title: "Secured",
    description: "Your information is securely stored and protected with us.",
  },
  {
    index: 5,
    icon: MessageSquareText,
    title: "Replies",
    description:
      "Engage in better conversations by replying directly to comments.",
  },
  {
    index: 6,
    icon: MessageCircle,
    title: "Private Messaging",
    description: "Chat privately with other users.",
  },
  {
    index: 7,
    icon: Earth,
    title: "Global & Campus Chats",
    description: "Join discussions across all campuses, or just your own.",
  },
  {
    index: 8,
    icon: AtSignIcon,
    title: "User Tagging",
    description:
      "Tag other users in posts to boost engagement and interaction.",
  },
  {
    index: 9,
    icon: VenetianMask,
    title: "NGL Feature",
    description: "Send anonymous messages with our NGL feature.",
  },
  {
    index: 10,
    icon: UserSearch,
    title: "Prof Finder",
    description: "Easily find professors and instructors at CvSU.",
  },
];

export const DEVS_INFO = [
  {
    index: 0,
    name: "Brice Suazo",
    role: "Full Stack Developer",
    image: "/dev-pics/brice.jpg",
    username: "@bricesuazo",
    link: "https://kabsu.me/bricesuazo",
    links: [
      { icon: Mail, url: "mailto:bricebrine.suazo@cvsu.edu.ph" },
      { icon: Globe, url: "https://bricesuazo.com/" },
      { icon: Github, url: "https://github.com/bricesuazo/" },
      { icon: Instagram, url: "https://www.instagram.com/brice_suazo/" },
      { icon: Twitter, url: "https://twitter.com/brice_suazo" },
    ],
  },
  {
    index: 1,
    name: "Alexis Ken Alvarez",
    role: "Full Stack Developer",
    image: "/dev-pics/aki.jpg",
    username: "@alexisken_alvarez",
    link: "https://kabsu.me/alexisken_alvarez",
    links: [
      { icon: Mail, url: "mailto:alexisken.alvarez@cvsu.edu.ph" },
      { icon: Globe, url: "https://www.akialvarez.com/" },
      { icon: Github, url: "https://github.com/AlexisKenAlvarez" },
      { icon: Instagram, url: "https://www.instagram.com/alexiskenalvarez/" },
    ],
  },
  {
    index: 2,
    name: "Kevin Roi Nuesca",
    role: "Frontend Developer",
    image: "/dev-pics/kevin.jpg",
    username: "@tfudoinkebs",
    link: "https://kabsu.me/tfudoinkebs",
    links: [
      { icon: Mail, url: "mailto:kevinroi.nuesca@cvsu.edu.ph" },
      { icon: Globe, url: "https://www.kevinnuesca.me/" },
      { icon: Github, url: "https://github.com/tfudoinkebs" },
      { icon: Instagram, url: "https://www.instagram.com/tfudoinkebs/" },
    ],
  },
  {
    index: 3,
    name: "Gabriel Luis Astilla",
    role: "UI/UX Designer",
    image: "/dev-pics/gab.jpg",
    username: "@gabriel",
    link: "https://kabsu.me/gabriel",
    links: [
      { icon: Mail, url: "mailto:gabrielluis.astilla@cvsu.edu.ph" },
      { icon: Globe, url: "https://gabrielastilla.me/" },
      { icon: Github, url: "https://github.com/GabrielAstilla" },
      { icon: Instagram, url: "https://www.instagram.com/gabrieeelluis/" },
    ],
  },
  {
    index: 4,
    name: "Rod Cotines",
    role: "Frontend Developer",
    image: "/dev-pics/rod.jpg",
    username: "@rodcotines",
    link: "https://kabsu.me/rodcotines",
    links: [
      { icon: Mail, url: "mailto:rodclarence.cotines@cvsu.edu.ph" },
      { icon: Globe, url: "https://rodcotines.me/" },
      { icon: Github, url: "https://github.com/rodcotines" },
      { icon: Instagram, url: "https://www.instagram.com/rod.cotines/" },
    ],
  },
  {
    index: 5,
    name: "AJ Espinosa",
    role: "Frontend Developer",
    image: "/dev-pics/aj.jpg",
    username: "@eyrooonnn",
    link: "https://kabsu.me/eyrooonnn",
    links: [
      { icon: Mail, url: "mailto:aaronjoshua.espinosa@cvsu.edu.ph" },
      { icon: Globe, url: "https://ajespinosa.vercel.app/" },
      { icon: Github, url: "https://github.com/aaronjoshuaespinosa" },
    ],
  },
  {
    index: 6,
    name: "Alex Buenviaje",
    role: "Project Manager",
    image: "/dev-pics/lex.jpg",
    username: "@lxbnvj",
    link: "https://kabsu.me/lxbnvj",
    links: [
      { icon: Mail, url: "mailto:alexkal-el.buenviaje@cvsu.edu.ph" },
      { icon: Instagram, url: "https://www.instagram.com/lxbnvj/" },
    ],
  },
  {
    index: 7,
    name: "Aries Dela Peña",
    role: "UI/UX Designer",
    image: "/dev-pics/aryas.jpg",
    username: "@aryasss",
    link: "https://kabsu.me/aryasss",
    links: [
      { icon: Mail, url: "mailto:aries.delapena@cvsu.edu.ph" },
      { icon: Instagram, url: "https://www.instagram.com/25aryasss52/" },
    ],
  },
  {
    index: 8,
    name: "Bernard Sarroca",
    role: "Project Manager Assistant",
    image: "/dev-pics/bernard.jpg",
    username: "@iamnards",
    link: "https://kabsu.me/iamnards",
    links: [
      { icon: Mail, url: "mailto:johnbernard.sarroca@cvsu.edu.ph" },
      { icon: Globe, url: "https://nardsarroca.vercel.app/" },
      { icon: Github, url: "https://github.com/iamnards" },
      { icon: Instagram, url: "https://www.instagram.com/i.am.nards/" },
    ],
  },
  {
    index: 9,
    name: "Rey Anthony de Luna",
    role: "Social Media Manager",
    image: "/dev-pics/rey.jpg",
    username: "@reydeluna",
    link: "https://kabsu.me/reydeluna",
    links: [
      { icon: Mail, url: "mailto:reyanthony.deluna@cvsu.edu.ph" },
      // Removed cause of privacy
      // { icon: Facebook, url: "https://facebook.com/reyanthony.deluna/" },
      { icon: Instagram, url: "https://www.instagram.com/rythnydln/" },
    ],
  },
];

export const REPORT_POST_REASONS = [
  {
    id: "spam",
    reason: "Spam",
  },
  {
    id: "inappropriate",
    reason: "Inappropriate",
  },
  {
    id: "abusive",
    reason: "Abusive or harmful",
  },
  {
    id: "discriminatory",
    reason: "Discriminatory",
  },
  {
    id: "other",
    reason: "Other",
  },
];

export const ONBOARDING_PAGES: Array<{
  title: string;
  content: string;
  image?: string;
  video?: string;
}> = [
  {
    title: "Welcome to Kabsu.me",
    content: "Connect, share, and explore new features with Kabsu.me!",
    image: "/onboarding-pics/Promotion 1.png",
  },
  {
    title: "Upload Photos",
    content: "Easily upload photos up to 5MB.",
    image: "/onboarding-pics/Promotion 2.png",
  },
  {
    title: "Comment Replies",
    content: "Reply directly to comments for better conversations.",
    image: "/onboarding-pics/Promotion 3.png",
  },
  {
    title: "Private Messaging",
    content: "Chat privately with other users.",
    image: "/onboarding-pics/Promotion 4.png",
  },
  {
    title: "Global & Campus Chats",
    content: "Join discussions across all campuses, or just your own.",
    image: "/onboarding-pics/Promotion 5.png",
  },
  {
    title: "User Tagging",
    content: "Tag other users in your posts for better engagement.",
    image: "/onboarding-pics/Promotion 13.png",
  },
  {
    title: "NGL Feature",
    content: "Send anonymous messages with our NGL feature.",
    image: "/onboarding-pics/Promotion 11.png",
  },
  {
    title: "Partners",
    content: "Proud partnerships.",
    image: "/onboarding-pics/Promotion 16.png",
  },
  {
    title: "Video Launch",
    content: "Proud partnerships.",
    video:
      "https://www.facebook.com/FacebookDevelopers/videos/10152454700553553/",
  },
];

export const THESIS_INFO = [
  {
    icon: {
      src: "/thesis-pics/adventura-logo.png",
      alt: "adventura-logo-img",
    },
    name: "Adventura 360°",
    description:
      "An Interactive Campus Tour for Cavite State University Don Severino Delas Alas Campus.",
    className: "col-span-5 lg:col-span-2",
    href: "https://adventura360.kabsu.me/",
    cta: "Learn more",
    background: {
      src: "/thesis-pics/adventura-background.png",
      alt: "adventura-background-img",
      className:
        "absolute h-full w-full object-cover object-top [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)]",
    },
  },
  {
    icon: {
      src: "/thesis-pics/arctec-logo.png",
      alt: "arctec-logo-img",
    },
    name: "ARCTEC",
    description: "Augmented Reality for CvSU Ladislao N. Diwa Memorial Library",
    className: "col-span-5 lg:col-span-2",
    href: "https://arctec.kabsu.me/",
    cta: "Learn more",
    background: {
      src: "/thesis-pics/arctec-background.png",
      alt: "arctec-background-img",
      className:
        "absolute top-0 h-full w-full object-cover [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)]",
    },
  },
  {
    icon: {
      src: "/thesis-pics/chromia-logo.png",
      alt: "chromia-logo-img",
    },
    name: "CHROMIA",
    description: "A Speech Command HCI Design for Google Chrome",
    className: "col-span-5 lg:col-span-1",
    href: "https://chromia.kabsu.me/",
    cta: "Learn more",
    background: {
      src: "/thesis-pics/chromia-background.png",
      alt: "chromia-background-img",
      className:
        "absolute h-full w-full object-cover object-top [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)]",
    },
  },
  {
    icon: {
      src: "/thesis-pics/eboto-logo.png",
      alt: "eboto-logo-img",
    },
    name: "eBoto",
    description: "One Stop Online Voting Solution",
    className: "col-span-5 lg:col-span-1",
    href: "https://eboto.app/",
    cta: "Learn more",
    background: {
      src: "/thesis-pics/eboto-background.png",
      alt: "eboto-background-img",
      className:
        "absolute h-full w-full object-cover object-top [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)]",
    },
  },
  {
    icon: {
      src: "/thesis-pics/odyssey-logo.png",
      alt: "odyssey-logo-img",
    },
    name: "Odyssey",
    description:
      "An Android-Based Mobile Augmented Reality Application for Interactive Experience at CvSU Historical and Cultural Museum",
    className: "col-span-5 lg:col-span-2",
    href: "https://odyssey.kabsu.me/",
    cta: "Learn more",
    background: {
      src: "/thesis-pics/odyssey-background.png",
      alt: "odyssey-background-img",
      className:
        "absolute h-full w-full object-cover object-top [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)]",
    },
  },
  {
    icon: {
      src: "/thesis-pics/swardify-logo.png",
      alt: "swardify-logo-img",
    },
    name: "SWARDify",
    description: "A Bidirectional Swardspeak and Tagalog Translator",
    className: "col-span-5 lg:col-span-2",
    href: "https://swardify.kabsu.me/",
    cta: "Learn more",
    background: {
      src: "/thesis-pics/swardify-background.png",
      alt: "swardify-background-img",
      className:
        "absolute h-full w-full object-cover object-top [--duration:20s] [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)]",
    },
  },
];
