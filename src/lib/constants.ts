import { nanoid } from "nanoid";

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
  id: "all" | "campus" | "program" | "college" | "following";
  name: string;
}[] = [
  {
    id: "all",
    name: "CvSU",
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
