"use client";

import React from "react";
import { Route } from "../../Sidebar/types";

interface PageTitleProps {
  currentRoute: Route;
}

export function PageTitle({ currentRoute }: PageTitleProps) {
  return (
    <h2 className="text-xl font-semibold capitalize text-text-primary">
      {currentRoute}
    </h2>
  );
}
