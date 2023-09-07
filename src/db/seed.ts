import { colleges, programs, users } from "./schema";
import { SEED_DATA } from "@/lib/constants";
import { db } from ".";
import { clerkClient } from "@clerk/nextjs/server";

async function main() {
  await db.transaction(async (trx) => {
    console.log("Users inserted!");

    await trx.insert(colleges).values(
      SEED_DATA.map((college) => ({
        id: college.id,
        name: college.name,
        slug: college.slug,
      })),
    );

    console.log("Colleges inserted!");

    await trx.insert(programs).values(
      SEED_DATA.flatMap((college) =>
        college.programs.map((program) => ({
          id: program.id,
          name: program.name,
          slug: program.slug,
          college_id: program.college_id,
        })),
      ),
    );

    console.log("Programs inserted!");

    const usersFromClerk = await clerkClient.users.getUserList();

    await trx.insert(users).values(
      usersFromClerk.map((user, index) => ({
        id: user.id,
        user_number: index + 1,
        program_id: "VHShXyNIG041O-4GHKcXK",
      })),
    );
  });

  console.log("Done seeding!");
}

main();
