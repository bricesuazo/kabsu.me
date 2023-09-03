import { nanoid } from "nanoid";

const COLLEGES = [
  {
    id: 0,
    name: "College of Engineering and Information Technology",
    slug: "ceit",
  },
  {
    id: 1,
    name: "College of Arts and Sciences",
    slug: "cas",
  },
];

const DEPARTMENTS = [
  {
    id: 0,
    name: "Department of Information Technology",
    slug: "dit",
    college_id: 0,
  },
  {
    id: 1,
    name: "Department of Electrical Engineering",
    slug: "dee",
    college_id: 0,
  },
];

const PROGRAMS = [
  {
    id: 0,
    name: "Bachelor of Science in Information Technology",
    slug: "bsit",
    department_id: 0,
  },
  {
    id: 1,
    name: "Bachelor of Science in Computer Science",
    slug: "bscs",
    department_id: 0,
  },
];

export const SEED_DATA = COLLEGES.map((college) => {
  const college_id = nanoid();

  return {
    id: college_id,
    name: college.name,
    slug: college.slug,

    departments: DEPARTMENTS.filter(
      (department) => department.college_id === college.id,
    ).map((department) => {
      const department_id = nanoid();

      return {
        id: department_id,
        name: department.name,
        slug: department.slug,
        college_id,

        programs: PROGRAMS.filter(
          (program) => program.department_id === department.id,
        ).map((program) => {
          const program_id = nanoid();

          return {
            id: program_id,
            name: program.name,
            slug: program.slug,
            department_id,
          };
        }),
      };
    }),
  };
});
