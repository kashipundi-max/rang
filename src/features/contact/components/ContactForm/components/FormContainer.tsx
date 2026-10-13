"use client";

import React from "react";
import { Card } from "@/components/Card";

interface FormContainerProps {
  children: React.ReactNode;
}

export function FormContainer({ children }: FormContainerProps) {
  return <Card animated>{children}</Card>;
}
