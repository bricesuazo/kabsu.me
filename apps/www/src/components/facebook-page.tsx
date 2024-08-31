"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { CardBody, CardContainer, CardItem } from "@kabsu.me/ui/3d-card";
import { Button } from "@kabsu.me/ui/button";

export function FacebookPage() {
  return (
    <div>
      <h1 className="w-full text-center text-4xl font-bold text-gray-800">
        Follow us on <span className="text-blue-600">Facebook</span>
      </h1>
      <h2 className="w-full text-center text-sm text-gray-500">
        This is for news and announcements of{" "}
        <button className="italic">
          <Link
            href="https://www.facebook.com/profile.php?id=61553962288015"
            target="_blank"
          >
            https://kabsu.me/
          </Link>
        </button>
      </h2>
      <CardContainer className="inter-var">
        <CardBody className="group/card relative h-auto w-auto rounded-xl border border-black/[0.1] bg-white p-4 dark:border-white/[0.2] dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1]">
          <CardItem translateZ="100" className="relative w-full">
            <Image
              src="/facebook-page.png"
              height="1000"
              width="1000"
              className="h-60 w-full rounded-lg object-cover group-hover/card:shadow-xl"
              alt="thumbnail"
            />
            <Link
              href="https://www.facebook.com/profile.php?id=61553962288015"
              target="_blank"
            >
              <Image
                src="/facebook-page-logo.jpg"
                height="120"
                width="100"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3/4 transform rounded-full border-2 border-white object-cover group-hover/card:shadow-xl dark:border-black"
                alt="thumbnail"
                style={{ cursor: "pointer" }}
              />
            </Link>
          </CardItem>
          <div className="mt-20 flex flex-col items-center justify-center">
            <CardItem
              translateZ={20}
              as="button"
              className="rounded-xl px-4 py-2 text-xl font-bold text-secondary-foreground transition-all duration-200 hover:text-xl dark:text-white"
            >
              <Link
                href="https://www.facebook.com/profile.php?id=61553962288015"
                target="_blank"
              >
                Kabsu.me
              </Link>
            </CardItem>

            <Button className="black font-bold text-white transition-all duration-200 hover:scale-110">
              <Link
                href="https://www.facebook.com/profile.php?id=61553962288015"
                target="_blank"
              >
                Visit us
              </Link>
            </Button>
          </div>
        </CardBody>
      </CardContainer>
    </div>
  );
}
