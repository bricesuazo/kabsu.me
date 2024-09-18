import React from "react";

import { FAQ_ITEMS } from "@kabsu.me/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@kabsu.me/ui/accordion";

export default function Faq() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {FAQ_ITEMS.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
