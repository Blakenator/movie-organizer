import React, { ReactNode } from 'react';
import { OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';

interface TooltipProps {
  title: ReactNode;
  trigger?: ('click' | 'focus' | 'hover') | ('click' | 'focus' | 'hover')[];
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  children,
  trigger = ['hover'],
}) => {
  return (
    <OverlayTrigger
      trigger={trigger}
      delay={200}
      overlay={<BootstrapTooltip>{title}</BootstrapTooltip>}
    >
      {children as any}
    </OverlayTrigger>
  );
};
