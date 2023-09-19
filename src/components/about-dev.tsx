import { DEVS_INFO } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Badge } from "@/components/ui/badge";

export default function AboutDev() {
  return (
    <div>
      <p className="py-4 text-center text-4xl font-bold text-primary">About</p>
      <p className="text-justify">
        <span className="ml-12"></span> Our accomplished team of developers and
        designers is responsible for crafting this tailored social media
        platform exclusively for Cavite State University students. Our mission
        is to enhance your university journey by providing a dedicated online
        space for meaningful connections and collaboration. Join us and be part
        of our commitment to academic and social excellence.
      </p>
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
                <p className="text-[12px] ">{dev.role}</p>
                <p className="text-[10px] text-foreground/70">{dev.desc}</p>
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
