import { FileObject, ParsedTvMetadata, ProcessedMatch } from './types';
import { orderBy } from 'lodash';
import { distance } from 'fastest-levenshtein';
import { transformPattern } from '../../../common/helpers';

export function compareFileToOptions(
  parsed: ParsedTvMetadata[],
  file: FileObject,
  ext: string
): ProcessedMatch[] {
  return orderBy(
    parsed.map((ep) => {
      const filename = file.filename.includes('-')
        ? file.filename.substring(file.filename.indexOf('-') + 1)
        : file.filename;
      const prevNormFilename = filename
        .substring(0, filename.lastIndexOf('.'))
        .trim();
      const episodeName = ep.name.trim();
      const rawDistance = distance(
        prevNormFilename.trim().toLowerCase(),
        episodeName.toLowerCase()
      );
      const newFilename = transformPattern('{tag} - {name}.{ext}', {
        ...ep,
        name: episodeName.replace(/[~"#%&*:<>?/\\{|}]+/g, ''),
        ext: ext,
      }).trim();
      const bestDistance = distance(
        prevNormFilename.toLowerCase(),
        newFilename
          .toLowerCase()
          .substring(0, newFilename.lastIndexOf('.'))
          .trim()
      );
      return {
        episode: ep,
        file,
        distance: bestDistance,
        prevNormFilename,
        newFilename,
        rawDistance: rawDistance,
        newFolderName: transformPattern('Season {seasonNumber}', { ...ep }),
      };
    }),
    ['distance', 'episode.tag'],
    ['asc', 'asc']
  ).slice(0, 5);
}
