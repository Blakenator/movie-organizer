import React from 'react';
import { ProgressBarInnerWrapper } from './wrappers';

interface ProgressBarProps {
  value: number;
  min?: number;
  max?: number;
  showMax?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  min = 0,
  max = 100,
  showMax,
}) => {
  const percent = Math.round(((value - min) * 100) / max);

  return (
    <div>
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,.2)',
          borderRadius: '.5em',
          padding: '.25em',
        }}
      >
        <ProgressBarInnerWrapper
          style={{
            width: percent + '%',
          }}
        >
          {percent + '%'}
          {showMax && (
            <>
              <span>{value}</span>/<span>{max - min}</span>
            </>
          )}
        </ProgressBarInnerWrapper>
      </div>
    </div>
  );
};
