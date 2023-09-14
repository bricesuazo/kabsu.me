import { Separator } from "@/components/ui/separator";

export default function InformationCenterPage() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-3xl font-bold text-primary">
        CvSU Information Center
      </h1>
      <Separator className="mx-auto w-40" />

      <h4 className="text-2xl">Truth | Excellence | Service</h4>

      <div className="mx-auto max-w-md">
        <h4 className="text-xl font-semibold">CvSU Mission</h4>
        <p className="[text-wrap:balance]">
          Cavite State University shall provide excellent, equitable, and
          relevant educational opportunities in the arts, sciences and
          technology through quality instruction and responsive research and
          development activities.
        </p>
      </div>
      <div className="mx-auto max-w-md">
        <h4 className="text-xl font-semibold">CvSU Vision</h4>
        <p className="[text-wrap:balance]">
          The Premier University in historic Cavite globally recognized for
          excellence in character development, academics, research, innovation
          and sustainable community engagement.
        </p>
      </div>

      <Separator className="mx-auto w-10" />

      <div className="space-y-4">
        <h4 className="text-xl font-semibold">CvSU Hymn</h4>
        <iframe
          className="aspect-video w-full"
          src="https://www.youtube.com/embed/A2fOWAo9jME?si=tnYfyrktvR4VUofk"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <p className="[text-wrap:balance]">
          Hail Alma Mater Dear
          <br />
          CvSU all the way through
          <br />
          Seat of hope that we dream of
          <br />
          Under the sky so blue
          <br />
          <br />
          Verdant fields God&apos;s gift to you
          <br />
          Open our lives a new
          <br />
          Oh, our hearts, our hands, our minds, too
          <br />
          In your bossom thrive and grow.
          <br />
          <br />
          Seeds of hope are now in bloom
          <br />
          Vigilant sons to you have sworn
          <br />
          To CvSU our faith goes on
          <br />
          Cradle of hope and bright vision.
          <br />
          <br />
          These sturdy arms that care
          <br />
          Are the nation builders
          <br />
          Blessed with strength and power
          <br />
          To our Almighty we offer.
          <br />
          <br />
          We Pray for CvSU God&apos;s
          <br />
          Blessing be with you
          <br />
          You&apos;re the master, we&apos;re the builders
          <br />
          CvSU leads forever.
        </p>
      </div>
    </div>
  );
}
