import Image from "next/image";
import Link from "next/link";

import Footer from "~/components/footer";

export default function AdventuraPage() {
  return (
    <div className="space-y-8">
      <div className="">
        <div className="relative mx-auto aspect-video w-80">
          <Link href="https://placide.itch.io/adventura" target="_blank">
            <Image
              src="/adventura-logo.png"
              alt=""
              fill
              sizes="100%"
              className="pointer-events-none hidden select-none object-contain dark:block"
            />
            <Image
              src="/adventura-logo-dark.png"
              alt=""
              fill
              sizes="100%"
              className="pointer-events-none select-none object-contain dark:hidden"
            />
          </Link>
        </div>
        <iframe
          src="https://itch.io/embed-upload/7325386?color=4ad946"
          allowFullScreen
          className="aspect-video size-full"
        >
          {/* <a href="https://placide.itch.io/adventura">
          Play Adventura: An Online Interactive Campus Tour on itch.io
        </a> */}
        </iframe>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">
          WELCOME TO ADVENTURA
        </h1>
        <p className="text-balance">
          Adventura is a Visual Novel game that allows the users to navigate
          inside the actual place of Cavite State University Indang Campus.
        </p>
      </div>

      <div className="text-center">
        <h1 className="text-xl font-semibold text-primary">About the Game</h1>
        <p className="text-balance">
          You play as a curious Visitor or a Student of the campus. Navigating
          different places of the campus and learning its history and their
          purpose. Using the Itinerary as list of places the campus has, the
          Street View as a way to navigate on foot, and lastly the Map as a way
          to quickly travel to places inside the campus.
        </p>
      </div>

      <div>
        <h5 className="text-center text-xl font-semibold text-primary">
          Meet the Creators
        </h5>
        <div className="relative aspect-video w-full">
          <Image
            src="/adventura-devs.png"
            alt="Adventura creators"
            fill
            className="pointer-events-none select-none object-contain"
            draggable={false}
          />
        </div>

        <p className="text-balance text-center">
          This game is developed by the Team Sen'Py, consisting of three people
          which are students from Cavite State University Indang Campus.
        </p>
      </div>

      <p className="text-balance text-center text-xs">
        For more information about the game, please visit the game&apos;s
        itch.io page.
      </p>
      <iframe src="https://itch.io/embed/1879915" className="w-full">
        {/* <a href="https://placide.itch.io/adventura">
          Adventura: An Online Interactive Campus Tour by Placide, Von
        </a> */}
      </iframe>

      <Footer />
    </div>
  );
}
