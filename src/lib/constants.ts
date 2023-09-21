import { POST_TYPE } from "@/lib/db/schema";
import { nanoid } from "nanoid";

import { Twitter, Instagram, Github, Globe, Mail } from "lucide-react";

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
    id: 0,
    name: "Bachelor of Science in Agriculture Major in Animal Science",
    slug: "bsa-as",
    college_id: 0,
  },
  {
    id: 1,
    name: "Bachelor of Science in Agriculture Major in Crop Science",
    slug: "bsa-cs",
    college_id: 0,
  },
  {
    id: 2,
    name: "Bachelor of Science in Environmental Science",
    slug: "bses",
    college_id: 0,
  },
  {
    id: 3,
    name: "Bachelor of Science in Food Technology",
    slug: "bsft",
    college_id: 0,
  },
  {
    id: 4,
    name: "Bachelor of Science in Land Use Design and Management",
    slug: "bsludm",
    college_id: 0,
  },
  {
    id: 5,
    name: "Bachelor in Agricultural Entrepreneurship",
    slug: "bae",
    college_id: 0,
  },
  {
    id: 6,
    name: "Bachelor of Science in Biology",
    slug: "bs-bio",
    college_id: 1,
  },
  {
    id: 7,
    name: "Bachelor of Arts in English Language Studies",
    slug: "baels",
    college_id: 1,
  },
  {
    id: 8,
    name: "Bachelor of Science in Psychology",
    slug: "bsp",
    college_id: 1,
  },
  {
    id: 9,
    name: "Bachelor of Arts in Political Science",
    slug: "baps",
    college_id: 1,
  },
  {
    id: 10,
    name: "Bachelor of Science in Social Work",
    slug: "bssw",
    college_id: 1,
  },
  {
    id: 11,
    name: "Bachelor of Science in Applied Mathematics",
    slug: "bsam",
    college_id: 1,
  },
  {
    id: 12,
    name: "Bachelor of Science in Criminology",
    slug: "bs-crim",
    college_id: 2,
  },
  {
    id: 13,
    name: "Bachelor of Science in Industrial Security Management",
    slug: "bsism",
    college_id: 2,
  },
  {
    id: 14,
    name: "Bachelor of Elementary Education",
    slug: "bee",
    college_id: 3,
  },
  {
    id: 15,
    name: "Bachelor of Secondary Education - Major in English",
    slug: "bse-eng",
    college_id: 3,
  },
  {
    id: 16,
    name: "Bachelor of Secondary Education - Major in Science",
    slug: "bse-sci",
    college_id: 3,
  },
  {
    id: 17,
    name: "Bachelor of Secondary Education - Major in Filipino",
    slug: "bse-fil",
    college_id: 3,
  },
  {
    id: 18,
    name: "Bachelor of Secondary Education - Major in Mathematics",
    slug: "bse-math",
    college_id: 3,
  },
  {
    id: 19,
    name: "Bachelor of Secondary Education - Major in Social Science",
    slug: "bse-socsci",
    college_id: 3,
  },
  {
    id: 20,
    name: "Bachelor of Science in Tourism Management",
    slug: "bstm",
    college_id: 3,
  },
  {
    id: 21,
    name: "Bachelor of Early Childhood Education",
    slug: "bece",
    college_id: 3,
  },
  {
    id: 22,
    name: "Bachelor of Special Needs Education",
    slug: "bsne",
    college_id: 3,
  },
  {
    id: 23,
    name: "Bachelor of Technology and Livelihood Education",
    slug: "btle",
    college_id: 3,
  },
  {
    id: 24,
    name: "Bachelor of Science in Hospitality Management",
    slug: "bshm",
    college_id: 3,
  },
  {
    id: 25,
    name: "Bachelor of Science in Accountancy",
    slug: "bs-acc",
    college_id: 4,
  },
  {
    id: 26,
    name: "Bachelor of Science in Business Management",
    slug: "bsbm",
    college_id: 4,
  },
  {
    id: 27,
    name: "Bachelor of Science in Economics",
    slug: "bs-econ",
    college_id: 4,
  },
  {
    id: 28,
    name: "Bachelor of Science in Development  Management",
    slug: "bsdm",
    college_id: 4,
  },
  {
    id: 29,
    name: "Bachelor of Science in international Studies",
    slug: "bsis",
    college_id: 4,
  },
  {
    id: 30,
    name: "Bachelor of Science in Agricultural and Biosystems Engineering",
    slug: "bsabe",
    college_id: 5,
  },
  {
    id: 31,
    name: "Bachelor of Science in Architecture",
    slug: "bsarch",
    college_id: 5,
  },
  {
    id: 32,
    name: "Bachelor of Science in Civil Engineering",
    slug: "bsce",
    college_id: 5,
  },
  {
    id: 33,
    name: "Bachelor of Science in Computer Engineering",
    slug: "bscomp-eng",
    college_id: 5,
  },
  {
    id: 34,
    name: "Bachelor of Science in Computer Science",
    slug: "bscs",
    college_id: 5,
  },
  {
    id: 35,
    name: "Bachelor of Science in Electrical Engineering",
    slug: "bsee",
    college_id: 5,
  },
  {
    id: 36,
    name: "Bachelor of Science in Electronics Engineering",
    slug: "bseee",
    college_id: 5,
  },
  {
    id: 37,
    name: "Bachelor of Science in Industrial Engineering",
    slug: "bsie",
    college_id: 5,
  },
  {
    id: 38,
    name: "Bachelor of Science in Industrial Technology Major in Automotive Technology",
    slug: "bsit-at",
    college_id: 5,
  },
  {
    id: 39,
    name: "Bachelor of Science in Industrial Technology Major in Electrical Technology",
    slug: "bsit-et",
    college_id: 5,
  },
  {
    id: 40,
    name: "Bachelor of Science in Industrial Technology Major in Electronics Technology",
    slug: "bsit-elex",
    college_id: 5,
  },
  {
    id: 41,
    name: "Bachelor of Science in Information Technology",
    slug: "bsit",
    college_id: 5,
  },
  {
    id: 42,
    name: "Bachelor of Science in Office Administration",
    slug: "bsoa",
    college_id: 5,
  },
  {
    id: 43,
    name: "Bachelor of Science in Nursing",
    slug: "bsn",
    college_id: 6,
  },
  {
    id: 44,
    name: "Bachelor of Science in Medical Technology",
    slug: "bsmt",
    college_id: 6,
  },
  {
    id: 45,
    name: "Bachelor of Science in Midwifery",
    slug: "bsm",
    college_id: 6,
  },
  {
    id: 46,
    name: "Bachelor of Physical Education",
    slug: "bped",
    college_id: 7,
  },
  {
    id: 47,
    name: "Bachelor of Exercise and Sports Sciences",
    slug: "bsess",
    college_id: 7,
  },
  {
    id: 48,
    name: "Doctor of Veterinary Medicine",
    slug: "dvm",
    college_id: 8,
  },
  {
    id: 49,
    name: "Bachelor of Science in Veterinary Technology",
    slug: "bsvt",
    college_id: 8,
  },
  {
    id: 50,
    name: "Bachelor of Science in  Animal Health and Management",
    slug: "bsahm",
    college_id: 8,
  },
  {
    id: 51,
    name: "Bachelor of Science in Biomedical Science",
    slug: "bsbs",
    college_id: 8,
  },
];

export const SEED_DATA = CAMPUSES.map((campus) => {
  const campus_id = nanoid();

  return {
    id: campus_id,
    name: campus.name,
    slug: campus.slug,

    colleges: COLLEGES.map((college) => {
      const college_id = nanoid();

      return {
        id: college_id,
        name: college.name,
        slug: college.slug,
        campus_id,

        programs: PROGRAMS.filter(
          (program) => program.college_id === college.id,
        ).map((program) => {
          const program_id = nanoid();

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

export const POST_TYPE_TABS: {
  id: (typeof POST_TYPE)[number];
  name: string;
}[] = [
  {
    id: "all",
    name: "All campus",
  },
  {
    id: "campus",
    name: "My Campus",
  },
  {
    id: "college",
    name: "My College",
  },
  {
    id: "program",
    name: "My Program",
  },
  {
    id: "following",
    name: "Following",
  },
];

export const NAVBAR_LINKS = [
  {
    name: "Home",
    url: "/",
  },
  {
    name: "About CvSU.me",
    url: "/about",
    hasSeparator: true,
  },
  {
    name: "CvSU Information Center",
    url: "/info",
  },
  {
    name: "University Registrar",
    url: "https://registrar.cvsu.edu.ph/",
  },
  {
    name: "Student Portal",
    url: "https://myportal.cvsu.edu.ph/",
  },
  {
    name: "CvSU LMS",
    url: "https://elearning.cvsu.edu.ph/my/",
    hasSeparator: true,
  },
  {
    name: "Play Adventura: An online campus tour",
    url: "/adventura",
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
]);

export const DEVS_INFO = [
  {
    index: 0,
    name: "Brice Suazo",
    role: "Full Stack Developer",
    image: "/dev-pics/brice.png",
    desc: "Saluysoy calculator developer, saluysoy predictor, and saluysoy predictor API developer.",
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
    name: "Aries Dela Peña",
    role: "UI/UX Designer",
    image: "/dev-pics/aryas.jpg",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    links: [
      { icon: Mail, url: "mailto:aries.delapena@cvsu.edu.ph" },
      { icon: Instagram, url: "https://www.instagram.com/25aryasss52/" },
    ],
  },
  {
    index: 2,
    name: "Gabriel Luis Astilla",
    role: "UI/UX Designer",
    image: "/dev-pics/gab.png",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    links: [
      { icon: Mail, url: "mailto:gabrielluis.astilla@cvsu.edu.ph" },
      { icon: Globe, url: "https://gabastilla.rf.gd/" },
      { icon: Github, url: "https://github.com/GabrielAstilla" },
      { icon: Instagram, url: "https://www.instagram.com/gabrieeelluis/" },
    ],
  },
  {
    index: 3,
    name: "Alexis Ken Alvarez",
    role: "Backend Developer",
    image: "/dev-pics/aki.png",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    links: [
      { icon: Mail, url: "mailto:alexisken.alvarez@cvsu.edu.ph" },
      { icon: Globe, url: "https://www.akialvarez.com/" },
      { icon: Github, url: "https://github.com/AlexisKenAlvarez" },
      { icon: Instagram, url: "https://www.instagram.com/alexiskenalvarez/" },
    ],
  },
  {
    index: 4,
    name: "Aaron Joshua Espinosa",
    role: "Frontend Developer",
    image: "/dev-pics/aj.jpg",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    links: [
      { icon: Mail, url: "mailto:aaronjoshua.espinosa@cvsu.edu.ph" },
      { icon: Globe, url: "https://ajespinosa.vercel.app/" },
      { icon: Github, url: "https://github.com/aaronjoshuaespinosa" },
    ],
  },
  {
    index: 5,
    name: "John Bernard Sarroca",
    role: "Backend Developer",
    image: "/dev-pics/bernard.jpg",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    links: [
      { icon: Mail, url: "mailto:johnbernard.sarroca@cvsu.edu.ph" },
      { icon: Github, url: "https://github.com/iamnards" },
      { icon: Instagram, url: "https://www.instagram.com/i.am.nards/" },
    ],
  },
  {
    index: 6,
    name: "Rod Clarence Cotines",
    role: "Frontend Developer",
    image: "/dev-pics/rod.jpeg",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    links: [
      { icon: Mail, url: "mailto:rodclarence.cotines@cvsu.edu.ph" },
      { icon: Globe, url: "https://rodcotines.vercel.app/" },
      { icon: Github, url: "https://github.com/Ayenzcc" },
      { icon: Instagram, url: "https://www.instagram.com/dururuyeye/" },
    ],
  },
  {
    index: 7,
    name: "Alex Kal-El Buenviaje",
    role: "Quality Assurance Tester",
    image: "/dev-pics/lex.jpg",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    links: [
      { icon: Mail, url: "mailto:alexkal-el.buenviaje@cvsu.edu.ph" },
      { icon: Instagram, url: "https://www.instagram.com/lxbnvj/" },
    ],
  },
];

export const REPORT_POST_REASONS = [
  {
    id: "spam",
    reason: "It's a spam",
  },
  {
    id: "inappropriate",
    reason: "It's inappropriate",
  },
  {
    id: "abusive",
    reason: "It's abusive or harmful",
  },
  {
    id: "racist",
    reason: "It's racist or discriminatory",
  },
  {
    id: "other",
    reason: "Other",
  },
];
