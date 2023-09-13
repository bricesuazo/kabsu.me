import { POST_TYPE } from "@/db/schema";
import { nanoid } from "nanoid";

import {
  Twitter,
  Facebook,
  Instagram,
  Github,
  Globe,
  Mail,
} from "lucide-react";

const CAMPUSES = [
  {
    id: "df4O69dvDl6ahsFFAZfDS",
    name: "Main Campus",
    slug: "main",
  },
];
const COLLEGES = [
  {
    id: "iwJ169yJSp8YWdW7SQvmJ",
    name: "College of Engineering and Information Technology",
    slug: "ceit",
    campus_id: "df4O69dvDl6ahsFFAZfDS",
  },
  {
    id: "0C5M7B2nm2mShaN2ukeo6",
    name: "College of Arts and Sciences",
    slug: "cas",
    campus_id: "df4O69dvDl6ahsFFAZfDS",
  },
];

const PROGRAMS = [
  {
    id: "Orpo4Wsq9Z5UuFjVN8qxj",
    name: "Bachelor of Science in Information Technology",
    slug: "bsit",
    college_id: "iwJ169yJSp8YWdW7SQvmJ",
  },
  {
    id: "VHShXyNIG041O-4GHKcXK",
    name: "Bachelor of Science in Computer Science",
    slug: "bscs",
    college_id: "iwJ169yJSp8YWdW7SQvmJ",
  },
];

export const SEED_DATA = CAMPUSES.map((campus) => {
  const campus_id = nanoid();

  return {
    id: campus.id,
    name: campus.name,
    slug: campus.slug,

    colleges: COLLEGES.map((college) => {
      const college_id = nanoid();

      return {
        id: college.id,
        name: college.name,
        slug: college.slug,
        campus_id: campus.id,

        programs: PROGRAMS.filter(
          (program) => program.college_id === college.id,
        ).map((program) => {
          const program_id = nanoid();

          return {
            id: program.id,
            name: program.name,
            slug: program.slug,
            college_id: program.college_id,
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

export const BLOCKED_USERNAMES = [
  "brice",
  "bricesuazo",
  "cg",
  "cvsu",
  "signup",
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
  "administrator",
];

export const DEVS_INFO = [
  {
    name: "Brice Brine Suazo",
    role: "Full Stack Developer",
    image: "/dev-pics/brice.png",
    links: [
      { icon: Mail, url: "mailto:bricebrine.suazo@cvsu.edu.ph" },
      { icon: Github, url: "https://github.com/bricesuazo/" },
      { icon: Facebook, url: "https://www.facebook.com/BriceSuazo/" },
      { icon: Instagram, url: "https://www.instagram.com/brice_suazo/" },
      { icon: Twitter, url: "https://twitter.com/brice_suazo" },
    ],
  },
  {
    name: "Aries Dela Pena",
    role: "UI/UX Designer",
    image: "/dev-pics/aries.jpg",
    links: [
      { icon: Mail, url: "mailto:aries.delapena@cvsu.edu.ph" },
      { icon: Facebook, url: "https://www.facebook.com/delapena.aries25" },
    ],
  },
  {
    name: "Gabriel Luis Astilla",
    role: "UI/UX Designer",
    image: "/dev-pics/gab.png",
    links: [
      { icon: Mail, url: "mailto:gabrielluis.astilla@cvsu.edu.ph" },
      { icon: Globe, url: "https://gabastilla.rf.gd/" },
      { icon: Github, url: "https://github.com/GabrielAstilla" },
      { icon: Facebook, url: "https://www.facebook.com/gabriel.astilla.7" },
      { icon: Instagram, url: "https://www.instagram.com/gabrieeelluis/" },
    ],
  },
  {
    name: "Alexis Ken Alvarez",
    role: "Backend Developer",
    image: "/dev-pics/aki.png",
    links: [
      { icon: Mail, url: "mailto:alexisken.alvarez@cvsu.edu.ph" },
      { icon: Globe, url: "https://www.akialvarez.com/" },
      { icon: Github, url: "https://github.com/AlexisKenAlvarez" },
      { icon: Facebook, url: "https://www.facebook.com/alvarez.aki/" },
      { icon: Instagram, url: "https://www.instagram.com/alexiskenalvarez/" },
    ],
  },
  {
    name: "Aaron Joshua Espinosa",
    role: "Frontend Developer",
    image: "/dev-pics/aj.jpg",
    links: [
      { icon: Mail, url: "mailto:aaronjoshua.espinosa@cvsu.edu.ph" },
      { icon: Globe, url: "https://ajespinosa.vercel.app/" },
      { icon: Github, url: "https://github.com/aaronjoshuaespinosa" },
    ],
  },
  {
    name: "John Bernard Sarroca",
    role: "Backend Developer",
    image: "/dev-pics/bernard.jpg",
    links: [
      { icon: Mail, url: "mailto:johnbernard.sarroca@cvsu.edu.ph" },
      { icon: Github, url: "https://github.com/iamnards" },
      { icon: Facebook, url: "https://www.facebook.com/bernarddddd" },
      { icon: Instagram, url: "https://www.instagram.com/i.am.nards/" },
    ],
  },
  {
    name: "Rod Clarence Cotines",
    role: "Frontend Developer",
    image: "/dev-pics/rod.jpeg",
    links: [
      { icon: Mail, url: "mailto:rodclarence.cotines@cvsu.edu.ph" },
      { icon: Github, url: "https://github.com/Ayenzcc" },
      { icon: Facebook, url: "https://www.facebook.com/dururuyeye/" },
      { icon: Instagram, url: "https://www.instagram.com/dururuyeye/" },
    ],
  },
  {
    name: "Alex Kal-El Buenviaje",
    role: "Quality Assurance Tester",
    image: "/dev-pics/lex.jpg",
    links: [
      { icon: Mail, url: "mailto:alexkal-el.buenviaje@cvsu.edu.ph" },
      { icon: Facebook, url: "https://www.facebook.com/LexBuenviaje" },
    ],
  },
];
