"use client";

import { ContactItem } from "./ContactItem";
import { useContactItems } from "../hooks";

export function ContactItemsList() {
  const { contactItems } = useContactItems();

  return (
    <div className="space-y-5">
      {contactItems.map((item) => (
        <ContactItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          value={item.value}
          href={item.href}
        />
      ))}
    </div>
  );
}
