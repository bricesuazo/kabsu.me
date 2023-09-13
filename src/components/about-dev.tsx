import { DEVS_INFO } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AboutDev() {
  return (
    <div>
      <p className="py-4 text-center text-4xl font-bold text-primary">About</p>
      <div className="grid grid-cols-1 gap-x-2 pb-20 sm:grid-cols-2">
        {DEVS_INFO.map((dev) => {
          return (
            <div className="flex flex-row items-center gap-x-4 rounded-lg p-4">
              <Image
                src={dev.image}
                alt={dev.name}
                className="rounded-full saturate-0"
                width="80"
                height="80"
              />
              <div className="flex flex-col items-start text-left">
                <p className="text-center font-semibold">{dev.name}</p>
                <p className="text-center text-sm">{dev.role}</p>
                <div className="flex gap-x-1 pt-2">
                  {dev.links.map((link) => {
                    return (
                      <Link
                        href={link.url}
                        target="_blank"
                        className="hover:text-primary"
                      >
                        <link.icon className="h-5 w-5" />
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
