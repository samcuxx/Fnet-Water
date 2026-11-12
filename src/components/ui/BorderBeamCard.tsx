"use client";

import { Card } from "@/components/tailgrids/core/card";
import { StatCardBeam, type StatCardBeamProps } from "@/components/ui/stat-card-beam";
import { cn } from "@/utils/cn";
import React, { ComponentProps } from "react";

export interface BorderBeamCardProps extends ComponentProps<typeof Card> {
  beamIndex?: number;
  beamColorFrom?: string;
  beamColorTo?: string;
  beamDuration?: number;
  beamDelay?: number;
  beamSize?: number;
  beamBorderWidth?: number;
  enableBeam?: boolean;
}

/**
 * BorderBeamCard: A responsive Card wrapper with an animated Magic UI border beam.
 * Each card gets a unique color gradient and animation speed based on beamIndex.
 */
export function BorderBeamCard({
  beamIndex = 0,
  beamColorFrom,
  beamColorTo,
  beamDuration,
  beamDelay,
  beamSize = 64,
  beamBorderWidth = 1.5,
  enableBeam = true,
  className,
  children,
  ...props
}: BorderBeamCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)} {...props}>
      {enableBeam && (
        <StatCardBeam
          index={beamIndex}
          colorFrom={beamColorFrom}
          colorTo={beamColorTo}
          duration={beamDuration}
          delay={beamDelay}
          size={beamSize}
          borderWidth={beamBorderWidth}
        />
      )}
      {children}
    </Card>
  );
}

export default BorderBeamCard;
