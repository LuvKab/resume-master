import React from "react";
import { FileText, LayoutTemplate, Settings2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconProps {
  size?: number;
  className?: string;
  active?: boolean;
}

const iconClassName = (active?: boolean, className?: string) =>
  cn(
    "transition-colors duration-200",
    active ? "text-q_acid" : "text-q_graphite",
    className
  );

const STROKE_WIDTH = 2.2;

export const IconResumes: React.FC<IconProps> = ({ size = 20, className, active }) => (
  <FileText
    size={size}
    strokeWidth={STROKE_WIDTH}
    className={iconClassName(active, className)}
    aria-hidden="true"
  />
);

export const IconTemplates: React.FC<IconProps> = ({ size = 20, className, active }) => (
  <LayoutTemplate
    size={size}
    strokeWidth={STROKE_WIDTH}
    className={iconClassName(active, className)}
    aria-hidden="true"
  />
);

export const IconSettings: React.FC<IconProps> = ({ size = 20, className, active }) => (
  <Settings2
    size={size}
    strokeWidth={STROKE_WIDTH}
    className={iconClassName(active, className)}
    aria-hidden="true"
  />
);

export const IconAI: React.FC<IconProps> = ({ size = 20, className, active }) => (
  <Sparkles
    size={size}
    strokeWidth={STROKE_WIDTH}
    className={iconClassName(active, className)}
    aria-hidden="true"
  />
);
