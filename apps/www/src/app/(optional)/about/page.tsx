import Image from "next/image";
import Link from "next/link";

import { DEVS_INFO } from "@cvsu.me/constants";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-center text-4xl font-bold text-primary">About</h1>
        <p className="text-center text-base [text-wrap:balance] sm:text-lg">
          We believe that having this platform, is essential for bringing
          together Cavite State University students, faculty, and alumni in a
          way that&apos;s exclusive and focused.
        </p>
      </div>
      <div>
        <h4 className=" text-center text-xl font-semibold text-primary">
          Who are we?
        </h4>
        <p className="mx-auto max-w-lg text-center">
          We are a group of passionate computer science students at Cavite State
          University - Main Campus.
        </p>
      </div>
      <div className="mx-auto grid grid-cols-1 gap-x-4 gap-y-4 self-center pt-4 sm:grid-cols-2 ">
        {DEVS_INFO.map((dev) => {
          return (
            <div
              key={dev.index}
              className="flex flex-row items-center gap-x-4 rounded-lg bg-secondary p-4 "
            >
              <Image
                src={dev.image}
                alt={dev.name}
                className=" rounded-full saturate-0"
                width="120"
                height="120"
              />

              <div className="flex  flex-col items-start gap-y-1 text-left">
                <p className="font-semibold text-primary ">{dev.name}</p>
                <Link
                  href={dev.link}
                  target="_blank"
                  className="hover:text-primary"
                >
                  <p className="text-[12px] font-medium ">{dev.username}</p>
                </Link>
                <p className="text-[12px] ">{dev.role}</p>

                {/* <p className="text-[10px] text-foreground/70">{dev.desc}</p> */}
                <div className="flex items-center gap-x-4 rounded-full pt-1 ">
                  {dev.links.map((link, i) => {
                    return (
                      <Link
                        key={i}
                        href={link.url}
                        target="_blank"
                        className="hover:text-primary"
                      >
                        <div className="grid place-items-center fill-white">
                          <link.icon size="1rem" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
