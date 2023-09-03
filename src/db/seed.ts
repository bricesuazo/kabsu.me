import { colleges, departments, programs } from "./schema";
import { SEED_DATA } from "@/lib/constants";
import { db } from ".";

async function main() {
  await db.transaction(async (trx) => {
    await trx.insert(colleges).values(
      SEED_DATA.map((college) => ({
        id: college.id,
        name: college.name,
        slug: college.slug,
      })),
    );

    console.log("Colleges inserted!");

    await trx.insert(departments).values(
      SEED_DATA.flatMap((college) =>
        college.departments.map((department) => ({
          id: department.id,
          name: department.name,
          slug: department.slug,
          college_id: department.college_id,
        })),
      ),
    );

    console.log("Departments inserted!");

    await trx.insert(programs).values(
      SEED_DATA.flatMap((college) =>
        college.departments.flatMap((department) =>
          department.programs.map((program) => ({
            id: program.id,
            name: program.name,
            slug: program.slug,
            department_id: program.department_id,
          })),
        ),
      ),
    );

    console.log("Programs inserted!");
  });

  console.log("Done seeding!");
}

main();
