import { useEffect, useState } from "react";
import Image from "next/image";

import type { CarouselApi } from "@kabsu.me/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@kabsu.me/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@kabsu.me/ui/dialog";

export function ImagesViewer({
  open,
  setOpen,
  images,
  scrollTo = 0,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  images: { id: string; url: string }[];
  scrollTo: number;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    api.scrollTo(scrollTo, true);
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Images</DialogTitle>
        </DialogHeader>

        <Carousel setApi={setApi}>
          <CarouselContent>
            {images.map((image) => (
              <CarouselItem key={image.id} className="relative h-96">
                <Image
                  src={image.url}
                  alt="Image"
                  fill
                  className="object-contain"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="py-2 text-center text-sm text-muted-foreground">
          Image {current} of {count}
        </div>
      </DialogContent>
    </Dialog>
  );
}
