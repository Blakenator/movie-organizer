import { TvDbEntry, TvDbShow } from '../common/types';

import { JSDOM } from 'jsdom';

async function fetchTvDbDom(url: string, referrer: string) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:141.0) Gecko/20100101 Firefox/141.0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      Priority: 'u=0, i',
    },
    referrer: referrer,
    method: 'GET',
    mode: 'cors',
  });
  const txt = await res.text();
  const dom = new JSDOM(txt, {
    url: url,
    referrer: referrer,
    contentType: 'text/html',
    includeNodeLocations: true,
    storageQuota: 10000000,
  });
  const document = dom.window.document;
  return document;
}

export async function loadTvDbEpisodes(slug: string): Promise<TvDbEntry[]> {
  const document = await fetchTvDbDom(
    `https://www.thetvdb.com/series/${slug}/allseasons/official`,
    `https://www.thetvdb.com/series/${slug}`,
  );
  const elements = [...document.querySelectorAll('.list-group-item')];
  return elements.map((el) => ({
    tag: el.querySelector('.episode-label').textContent,
    name: el.querySelector('.list-group-item-heading a').textContent.trim(),
    description: el.querySelector('.list-group-item-text p').textContent.trim(),
  }));
}

export async function searchTvDb(searchText: string): Promise<TvDbShow[]> {
  const res = await fetch(
    'https://tvshowtime-dsn.algolia.net/1/indexes/*/queries?' +
      new URLSearchParams([
        [
          'x-algolia-agent',
          'Algolia for vanilla JavaScript (lite) 3.32.0;instantsearch.js (3.5.3);JS Helper (2.28.0)',
        ],
        ['x-algolia-application-id', 'tvshowtime'],
        ['x-algolia-api-key', 'c9d5ec1316cec12f093754c69dd879d3'],
      ]).toString(),
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:141.0) Gecko/20100101 Firefox/141.0',
        Accept: 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'content-type': 'application/x-www-form-urlencoded',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      referrer: 'https://www.thetvdb.com/',
      body: JSON.stringify({
        requests: [
          {
            indexName: 'TVDB',
            params: new URLSearchParams([
              ['query', searchText],
              ['maxValuesPerFacet', '10'],
              ['page', '0'],
              ['analytics', 'true'],
              ['analyticsTags', '["tvdb_web"]'],
              ['highlightPreTag', '__ais-highlight__'],
              ['highlightPostTag', '__/ais-highlight__'],
              ['filters', 'NOT is_official=0'],
              [
                'facets',
                '["type","year","network","status","type","year","network","status"]',
              ],
              ['tagFilters', ''],
            ]).toString(),
          },
        ],
      }),
      method: 'POST',
      mode: 'cors',
    },
  );
  const parsedJson = await res.json();
  return parsedJson.results[0].hits.map((show: any) => ({
    slug: show.slug,
    name: show.name,
    description: show.overview,
    releaseYear: show.release_year,
    coverPhotoSrc: show.image,
    id: show.id,
  }));
}
