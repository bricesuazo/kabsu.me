import { nanoid } from "nanoid";

const COLLEGES = [
  {
    id: "iwJ169yJSp8YWdW7SQvmJ",
    name: "College of Engineering and Information Technology",
    slug: "ceit",
  },
  {
    id: "0C5M7B2nm2mShaN2ukeo6",
    name: "College of Arts and Sciences",
    slug: "cas",
  },
];

const DEPARTMENTS = [
  {
    id: "fB86_dqHElEgCRwoZfqNh",
    name: "Department of Information Technology",
    slug: "dit",
    college_id: "iwJ169yJSp8YWdW7SQvmJ",
  },
  {
    id: "qJ8qx0lwNTtVZcZpBFjAK",
    name: "Department of Electrical Engineering",
    slug: "dee",
    college_id: "iwJ169yJSp8YWdW7SQvmJ",
  },
];

const PROGRAMS = [
  {
    id: "Orpo4Wsq9Z5UuFjVN8qxj",
    name: "Bachelor of Science in Information Technology",
    slug: "bsit",
    department_id: "fB86_dqHElEgCRwoZfqNh",
  },
  {
    id: "VHShXyNIG041O-4GHKcXK",
    name: "Bachelor of Science in Computer Science",
    slug: "bscs",
    department_id: "fB86_dqHElEgCRwoZfqNh",
  },
];

export const SEED_DATA = COLLEGES.map((college) => {
  const college_id = nanoid();

  return {
    id: college.id,
    name: college.name,
    slug: college.slug,

    departments: DEPARTMENTS.filter(
      (department) => department.college_id === college.id,
    ).map((department) => {
      const department_id = nanoid();

      return {
        id: department.id,
        name: department.name,
        slug: department.slug,
        college_id: department.college_id,

        programs: PROGRAMS.filter(
          (program) => program.department_id === department.id,
        ).map((program) => {
          const program_id = nanoid();

          return {
            id: program.id,
            name: program.name,
            slug: program.slug,
            department_id: program.department_id,
          };
        }),
      };
    }),
  };
});
