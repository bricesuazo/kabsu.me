import { campuses, colleges, programs, users } from "./schema";
import { SEED_DATA } from "@cvsu.me/constants";
import { db } from ".";

async function main() {
  await db.transaction(async (trx) => {
    await trx.insert(campuses).values(
      SEED_DATA.map((campus) => ({
        id: campus.id,
        name: campus.name,
        slug: campus.slug,
      })),
    );

    console.log("Campuses inserted!");

    await trx.insert(colleges).values(
      SEED_DATA.flatMap((campus) =>
        campus.colleges.map((college) => ({
          id: college.id,
          name: college.name,
          slug: college.slug,
          campus_id: college.campus_id,
        })),
      ),
    );

    console.log("Colleges inserted!");

    await trx.insert(programs).values(
      SEED_DATA.flatMap((campus) =>
        campus.colleges.flatMap((college) =>
          college.programs.map((program) => ({
            id: program.id,
            name: program.name,
            slug: program.slug,
            college_id: program.college_id,
          })),
        ),
      ),
    );

    console.log("Programs inserted!");

    const usersFromDB = await db.query.users.findMany();

    usersFromDB.length !== 0 &&
      (await trx.insert(users).values(
        usersFromDB.map((user, index) => ({
          id: user.id,
          user_number: index + 1,
          program_id: "VHShXyNIG041O-4GHKcXK",
          type: user.type,
        })),
      ));

    console.log("Users inserted!");
  });

  console.log("Done seeding!");
}

main();
