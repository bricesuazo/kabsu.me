import { db } from "@/db";
import AuthForm from "./auth-form";
import { Suspense } from "react";

export default async function Auth() {
  const colleges = await db.query.colleges.findMany();
  const departments = await db.query.departments.findMany();
  const programs = await db.query.programs.findMany();

  return (
    <Suspense>
      {/* <AuthForm data={{ colleges, departments, programs }} /> */}
    </Suspense>
  );
}
