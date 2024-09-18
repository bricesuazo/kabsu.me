import React from "react";

import ContactForm from "~/components/contact-form";
import FAQ from "~/components/faq";

const faq = () => {
  return (
    <div className="mx-4 my-10 flex flex-col gap-10 sm:m-10">
      <div className="flex flex-col space-y-5">
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-[-0.03em] text-primary duration-300 motion-reduce:transition-none">
            Frequently Asked Questions
          </h1>
          <h2 className="text-muted-foreground">
            Have questions? We&apos;re here to help.
          </h2>
        </div>
        <FAQ />
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-center text-4xl font-bold tracking-[-0.03em] text-primary duration-300 motion-reduce:transition-none">
          Contact Us
        </h1>
        <p className="mx-auto text-balance text-center">
          Still have any questions or concerns? Feel free to reach out to us!
        </p>
        <ContactForm />
      </div>
    </div>
  );
};

export default faq;
