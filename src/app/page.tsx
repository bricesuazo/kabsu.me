import { auth } from "@clerk/nextjs";
import PostForm from "@/components/post-form";
import Posts from "@/components/posts";
import { Suspense } from "react";
import Auth from "@/components/auth";
import { nanoid } from "nanoid";

export default function Home() {
  const { userId } = auth();

  // const test = [
  //   {
  //     id: "C6J26QZhLgNZwDlLCaf2O",
  //     name: "College of Engineering and Information Technology",
  //     slug: "ceit",
  //     departments: [
  //       {
  //         id: "EbXimH7enb8KmH-62o8R1",
  //         name: "Department of Information Technology",
  //         slug: "dit",
  //         college_id: "C6J26QZhLgNZwDlLCaf2O",
  //         programs: [
  //           {
  //             id: "y-O1nm3ZbtueUSFtbeO7c",
  //             name: "Bachelor of Science in Information Technology",
  //             slug: "bsit",
  //             department_id: "EbXimH7enb8KmH-62o8R1",
  //           },
  //           {
  //             id: "AL3lh1heIsOma5n9AbENh",
  //             name: "Bachelor of Science in Computer Science",
  //             slug: "bscs",
  //             department_id: "EbXimH7enb8KmH-62o8R1",
  //           },
  //         ],
  //       },
  //       {
  //         id: "TazmdV8k08Nmg09qMl-wb",
  //         name: "Department of Electrical Engineering",
  //         slug: "dee",
  //         college_id: "C6J26QZhLgNZwDlLCaf2O",
  //         programs: [
  //           {
  //             id: "Mc7gllGb95ez_PRAEPylL",
  //             name: "Bachelor of Science in Information Technology",
  //             slug: "bsit",
  //             department_id: "TazmdV8k08Nmg09qMl-wb",
  //           },
  //           {
  //             id: "Ppm-oDfEqLhwSCRDerDqs",
  //             name: "Bachelor of Science in Computer Science",
  //             slug: "bscs",
  //             department_id: "TazmdV8k08Nmg09qMl-wb",
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     id: "pXgM-yFrp5edDccV9Jg_3",
  //     name: "College of Arts and Sciences",
  //     slug: "cas",
  //     departments: [
  //       {
  //         id: "t4ShSVen6MuonrgO4dDeg",
  //         name: "Department of Information Technology",
  //         slug: "dit",
  //         college_id: "pXgM-yFrp5edDccV9Jg_3",
  //         programs: [
  //           {
  //             id: "Q6DcX54LfabimODcNKlWO",
  //             name: "Bachelor of Science in Information Technology",
  //             slug: "bsit",
  //             department_id: "t4ShSVen6MuonrgO4dDeg",
  //           },
  //           {
  //             id: "Eb1DavThEM-W6r7Techn_",
  //             name: "Bachelor of Science in Computer Science",
  //             slug: "bscs",
  //             department_id: "t4ShSVen6MuonrgO4dDeg",
  //           },
  //         ],
  //       },
  //       {
  //         id: "j_bIqMakPXysfUNGQmzsw",
  //         name: "Department of Electrical Engineering",
  //         slug: "dee",
  //         college_id: "pXgM-yFrp5edDccV9Jg_3",
  //         programs: [
  //           {
  //             id: "8da7xr0rycTIHbyKXvESd",
  //             name: "Bachelor of Science in Information Technology",
  //             slug: "bsit",
  //             department_id: "j_bIqMakPXysfUNGQmzsw",
  //           },
  //           {
  //             id: "h0cBaqmHqt6Tn0PcGONFL",
  //             name: "Bachelor of Science in Computer Science",
  //             slug: "bscs",
  //             department_id: "j_bIqMakPXysfUNGQmzsw",
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // ];

  return (
    <main className="container">
      {userId ? (
        <>
          {/* <h2 className="text-2xl font-bold">Greetings, @{user?.username}</h2> */}

          <PostForm />

          <Suspense fallback="Loading...">
            <Posts />
          </Suspense>
        </>
      ) : (
        <Auth />
      )}
    </main>
  );
}
