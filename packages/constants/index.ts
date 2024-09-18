import type { LucideIcon } from "lucide-react";
import {
  AtSignIcon,
  BadgeCheck,
  Blocks,
  Book,
  BookOpenCheck,
  Clock,
  Earth,
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
  MailQuestionIcon,
  MapPin,
  MessageCircle,
  MessageSquareText,
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
  },
  {
    icon: MailQuestionIcon,
    name: "Frequently Asked Questions",
    url: "/faq",
    hasSeparator: true,
  },
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
    name: "Brice Suazo",
    role: "Lead Full-stack Developer",
    image: "/dev-pics/brice.webp",
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
    name: "Gabriel Luis Astilla",
    role: "Lead UI/UX Designer",
    image: "/dev-pics/gab.webp",
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
    name: "Alex Buenviaje",
    role: "Lead Project Manager",
    image: "/dev-pics/lex.webp",
    username: "@lxbnvj",
    link: "https://kabsu.me/lxbnvj",
    links: [
      { icon: Mail, url: "mailto:alexkal-el.buenviaje@cvsu.edu.ph" },
      { icon: Instagram, url: "https://www.instagram.com/lxbnvj/" },
    ],
  },
  {
    name: "Alexis Ken Alvarez",
    role: "Full-stack Developer",
    image: "/dev-pics/aki.webp",
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
    name: "Kevin Roi Nuesca",
    role: "Lead Front-end Developer",
    image: "/dev-pics/kevin.webp",
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
    name: "Rod Cotines",
    role: "Front-end Developer",
    image: "/dev-pics/rod.webp",
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
    name: "AJ Espinosa",
    role: "Front-end Developer",
    image: "/dev-pics/aj.webp",
    username: "@eyrooonnn",
    link: "https://kabsu.me/eyrooonnn",
    links: [
      { icon: Mail, url: "mailto:aaronjoshua.espinosa@cvsu.edu.ph" },
      { icon: Globe, url: "https://ajespinosa.vercel.app/" },
      { icon: Github, url: "https://github.com/aaronjoshuaespinosa" },
    ],
  },

  {
    name: "Aries Dela Peña",
    role: "UI/UX Designer Assistant",
    image: "/dev-pics/aryas.webp",
    username: "@aryasss",
    link: "https://kabsu.me/aryasss",
    links: [
      { icon: Mail, url: "mailto:aries.delapena@cvsu.edu.ph" },
      { icon: Instagram, url: "https://www.instagram.com/25aryasss52/" },
    ],
  },
  {
    name: "Bernard Sarroca",
    role: "Project Manager Assistant",
    image: "/dev-pics/bernard.webp",
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
    name: "Rey Anthony de Luna",
    role: "Social Media Manager",
    image: "/dev-pics/rey.webp",
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

export const ONBOARDING_PAGES: {
  title: string;
  content: string;
  image?: string;
  video?: string;
}[] = [
  {
    title: "Welcome to Kabsu.me",
    content: "Connect, share, and explore new features with Kabsu.me!",
    image: "/onboarding-pics/Promotion 1.webp",
  },
  {
    title: "Upload Photos",
    content: "Easily upload photos up to 5MB.",
    image: "/onboarding-pics/Promotion 2.webp",
  },
  {
    title: "Comment Replies",
    content: "Reply directly to comments for better conversations.",
    image: "/onboarding-pics/Promotion 3.webp",
  },
  {
    title: "Private Messaging",
    content: "Chat privately with other users.",
    image: "/onboarding-pics/Promotion 4.webp",
  },
  {
    title: "Global & Campus Chats",
    content: "Join discussions across all campuses, or just your own.",
    image: "/onboarding-pics/Promotion 5.webp",
  },
  {
    title: "User Tagging",
    content: "Tag other users in your posts for better engagement.",
    image: "/onboarding-pics/Promotion 13.webp",
  },
  {
    title: "NGL Feature",
    content: "Send anonymous messages with our NGL feature.",
    image: "/onboarding-pics/Promotion 11.webp",
  },
  {
    title: "Partners",
    content: "Proud partnerships.",
    image: "/onboarding-pics/Promotion 16.webp",
  },
  {
    title: "Video Launch",
    content: "Kabsu.me - Video Launch",
    video: "https://www.facebook.com/kabsu.me/videos/755260903340962",
  },
];

export const FAQ_ITEMS = [
  {
    value: "item-1",
    question:
      "How can freshmen create an account if we don't have a CvSU email yet?",
    answer:
      "You can only log in using a CvSU email address that ends with @cvsu.edu.ph. If you haven’t received your CvSU email yet, please wait until it is provided.",
  },
  {
    value: "item-2",
    question: "When will Kabsu.me add other campuses?",
    answer:
      "We’re excited to add other campuses soon—it’s definitely on our to-do list!",
  },
  {
    value: "item-3",
    question: "Where can I suggest a feature or report a problem?",
    answer:
      'After signing in, head to the upper right corner, click your profile icon, and you’ll find options to "Suggest a Feature" or "Report a Problem."',
  },
  {
    value: "item-4",
    question: "Where can I ask inquiries, express concerns, or access FAQs?",
    answer:
      "You can submit inquiries or concerns at the bottom of our homepage. Alternatively, sign in to your account, open the side navigation bar in the upper left corner of your screen, and find the Frequently Asked Questions button.",
  },
  {
    value: "item-5",
    question: "How can I disable my NGL in my profile?",
    answer:
      'Sign in to your account, go to the upper right corner, click the profile icon, then click "Account Settings." Uncheck the "Display my NGL page" option. You can enable it again by re-checking the box in the same settings.',
  },
  {
    value: "item-6",
    question: "How can I change my roles in my account?",
    answer:
      'Sign in to your account, click the profile icon in the upper right corner, and select "Account Settings." You can change your role, campus, college, and program there. Note that you can only make these changes once every 3 months.',
  },
  {
    value: "item-7",
    question: "How can I report a post or ban users posting malicious content?",
    answer:
      "If you spot something inappropiate, click the three dots (kebab button) on the post to report it. We review all reports and have a strike system—three strikes and the user will be banned from the platform.",
  },
];
