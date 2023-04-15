import React, { ReactElement, ReactNode, useMemo, useState } from 'react';
import { max, min } from 'lodash';
import { HistogramBar } from './wrappers';

interface HistogramProps<T> {
  dataset: T[];
  calcScore: (item: T) => number;
  numBuckets: number;
  maxValue?: number;
  header?: ReactNode;
}

export const Histogram = <T,>({
  dataset,
  calcScore,
  numBuckets,
  maxValue,
  header,
}: HistogramProps<T>): ReactElement => {
  const [showFullRange, setShowFullRange] = useState(false);
  const [heightOverTotal, setHeightOverTotal] = useState(false);
  const {
    bucketSums: bucketValues,
    bucketMax,
    bucketMin,
    bucketCountMin,
    bucketCountMax,
    bucketSize,
  } = useMemo(() => {
    const bucketSums = new Array(numBuckets).fill(0);

    const scores = dataset.map((item) => calcScore(item));
    const bucketMax = showFullRange ? maxValue : max(scores);
    const bucketMin = min(scores);
    const bucketSize = (bucketMax - bucketMin) / numBuckets;

    scores.forEach(
      (score) =>
        bucketSums[Math.min(numBuckets - 1, Math.floor(score / bucketSize))]++
    );
    const bucketCountMax = max(bucketSums);
    const bucketCountMin = min(bucketSums);

    return {
      bucketSums,
      bucketMin,
      bucketMax,
      bucketCountMax,
      bucketCountMin,
      bucketSize,
    };
  }, [dataset, calcScore, numBuckets, showFullRange]);

  return (
    <div className="d-flex flex-column">
      <div className="d-flex align-items-center" style={{ gap: '1em' }}>
        <span>{header}</span>
        {maxValue !== undefined && (
          <label>
            <input
              className="me-2"
              type="checkbox"
              checked={showFullRange}
              onClick={() => setShowFullRange(!showFullRange)}
            />
            Show Full Range
          </label>
        )}
        <label>
          <input
            className="me-2"
            type="checkbox"
            checked={heightOverTotal}
            onClick={() => setHeightOverTotal(!heightOverTotal)}
          />
          Scale Height
        </label>
      </div>
      {dataset.length > 0 && (
        <div
          style={{
            display: 'grid',
            gap: '.5em',
            height: '10em',
            gridTemplateColumns: `repeat(${numBuckets},1fr)`,
            gridTemplateRows: '1fr 3em',
          }}
        >
          {bucketValues.map((value, i) => (
            <div
              key={i}
              style={{
                height: '100%',
                width: '100%',
                borderRadius: '.5em',
                position: 'relative',
                overflow: 'hidden',
              }}
              className="bg-light"
              title={
                value +
                ' (' +
                Math.round((value / dataset.length) * 1000) / 10 +
                '%)'
              }
            >
              <HistogramBar
                style={{
                  height:
                    Math.round(
                      (value /
                        (heightOverTotal ? dataset.length : bucketCountMax)) *
                        100
                    ) + '%',
                }}
                className={'bg-success text-white'}
              >
                {value}
              </HistogramBar>
            </div>
          ))}
          {bucketValues.map((value, i) => (
            <div key={i}>
              {Math.round(bucketSize * i * 10) / 10} -{' '}
              {Math.round(bucketSize * (i + 1) * 10) / 10}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
