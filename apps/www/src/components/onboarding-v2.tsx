import { useState } from "react";
import confetti from "canvas-confetti";

import { Button } from "@kabsu.me/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@kabsu.me/ui/dialog";

import { useLocalStorage } from "~/hooks/use-local-storage";
import { useMediaQuery } from "~/hooks/use-media-query";

export default function OnboardingV2() {
  const [page, setPage] = useState(0);
  const [isOnboardingV2, setIsOnboardingV2] = useLocalStorage(
    "onboarding-v2",
    true,
  );
  const isDesktop = useMediaQuery("(min-width: 768px)");
  function fireConfetti() {
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
  }
  return (
    <Dialog
      open={isOnboardingV2}
      onOpenChange={(value) => {
        if (!value) fireConfetti();
        setIsOnboardingV2(value);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anong bago sa Kabsu.me?</DialogTitle>
        </DialogHeader>

        {/* TODO: Add content here */}
        <div>
          {page === 0 ? (
            <div>
              <p>Page 1</p>

              <Button onClick={() => setPage(1)}>Next</Button>
            </div>
          ) : page === 1 ? (
            <div>
              <p>Page 2</p>
              <Button onClick={() => setPage(2)}>Next</Button>
            </div>
          ) : (
            <div>
              <p>last page</p>
              <Button
                onClick={() => {
                  fireConfetti();
                  setIsOnboardingV2(false);
                }}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
