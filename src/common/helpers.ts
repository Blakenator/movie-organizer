import { PlexFile, PlexMovieMetadata, TransformedPaths } from './types';

export function getFancyResolution(resolution: string | number): string {
  const breakpoints: [number, string][] = [
    [1500, '4K'],
    [1150, '1440p'],
    [760, '1080p'],
    [670, '720p'],
    [510, '640p'],
    [290, '480p'],
    [0, '240p'],
  ];

  return breakpoints.find(([min]) => +resolution > min)[1];
}

export function replacementsFromMovie(
  movie: PlexFile<PlexMovieMetadata>
): Record<string, string> {
  return {
    title: movie.metadata.title
      .replace(/[\\/*?"<>|]/g, '')
      .replace(/[:]/g, ' -')
      .trim(),
    resolution: getFancyResolution(movie.metadata.resolution),
    year: new Date(movie.metadata.airDate).getFullYear().toString(),
  };
}

export function transformPattern(
  pattern: string,
  replacements: Record<string, string>
) {
  let result = pattern;
  Object.entries(replacements).forEach(([key, val]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'gi'), val);
  });
  return result.trim();
}

export function transformMoviePath(
  movie: PlexFile<PlexMovieMetadata>,
  pattern: string
): TransformedPaths {
  const replacements = replacementsFromMovie(movie);
  const newBaseFilename = transformPattern(pattern, replacements);
  const newPaths = movie.filepaths.map((path) => {
    const pathWithoutLibrary = path.replace(movie.libraryPath + '/', '');
    const separator = path.match(/[\\/]/)[0];
    const segments = pathWithoutLibrary.split(/[\\/]/);
    const filename = segments[segments.length - 1];
    const extension = filename.includes('.')
      ? filename.substring(filename.lastIndexOf('.'))
      : '';
    return [
      movie.libraryPath,
      // gets everything up to the last two dirs, does not support movie files directly in
      // collection folders (not sure how to support that)
      ...segments.slice(0, -2),
      newBaseFilename,
      newBaseFilename + extension,
    ].join(separator);
  });
  return {
    id: movie.id,
    oldPaths: movie.filepaths,
    newPaths: newPaths,
    changed: movie.filepaths.some((path, i) => newPaths[i] !== path),
  };
}
