import React, { useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ONBOARDING_PAGES } from "@kabsu.me/constants";
import { Button } from "@kabsu.me/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@kabsu.me/ui/dialog";
import { Progress } from "@kabsu.me/ui/progress";

import { useLocalStorage } from "~/hooks/use-local-storage";
import { useMediaQuery } from "~/hooks/use-media-query";

const PageContent = ({
  title,
  content,
  image,
}: {
  title: string;
  content: string;
  image: string;
}) => (
  <div className="text-center">
    <div className="relative aspect-square w-full">
      <Image src={image} alt={title} fill className="object-cover" />
    </div>
    <h2 className="my-2 text-lg font-semibold">{title}</h2>
    <p className="h-12 text-sm text-muted-foreground">{content}</p>
  </div>
);

export default function OnboardingV2() {
  const [page, setPage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isOnboardingV2, setIsOnboardingV2] = useLocalStorage(
    "onboarding-v2",
    true,
  );
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const updateProgress = (currentPage: number) => {
    const percentage = Math.round(
      (currentPage / (ONBOARDING_PAGES.length - 1)) * 100,
    );
    setProgress(percentage);
  };

  const fireConfetti = () => {
    const end = Date.now() + 2 * 1000; // 2 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#2dac5c"];

    const frame = () => {
      if (Date.now() > end) return;

      void confetti({
        particleCount: isDesktop ? 5 : 2,
        angle: 60,
        spread: isDesktop ? 200 : 100,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      void confetti({
        particleCount: isDesktop ? 5 : 2,
        angle: 120,
        spread: isDesktop ? 200 : 100,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  const handleNext = () => {
    if (page < ONBOARDING_PAGES.length - 1) {
      const nextPage = page + 1;
      setPage(nextPage);
      updateProgress(nextPage);
    } else {
      fireConfetti();
      setIsOnboardingV2(false);
    }
  };

  const handlePrevious = () => {
    if (page > 0) {
      const prevPage = page - 1;
      setPage(prevPage);
      updateProgress(prevPage);
    }
  };

  return (
    <Dialog
      open={isOnboardingV2}
      onOpenChange={(value) => {
        if (!value) fireConfetti();
        setIsOnboardingV2(value);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            Anong bago sa Kabsu.me v2?
          </DialogTitle>
        </DialogHeader>
        <div className="flex w-full items-center justify-between gap-2">
          <Progress value={progress} />
          <h1 className="text-sm font-medium text-muted-foreground">
            {progress}%
          </h1>
        </div>
        <div className="space-y-2">
          <PageContent
            {...(ONBOARDING_PAGES[page] as {
              title: string;
              content: string;
              image: string;
            })}
          />

          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={page === 0}
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-xs font-medium">
              {page + 1} / {ONBOARDING_PAGES.length}
            </div>
            <Button onClick={handleNext}>
              {page === ONBOARDING_PAGES.length - 1 ? (
                "Done"
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
