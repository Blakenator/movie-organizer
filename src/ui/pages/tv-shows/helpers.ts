import {
  FileObject,
  ParsedTvMetadata,
  ProcessedMatch,
  RenameSettings,
} from './types';
import { orderBy } from 'lodash';
import { distance } from 'fastest-levenshtein';
import { transformPattern } from '../../../common/helpers';
import { TransformedPaths } from '../../../common/types';

export function compareFileToOptions(
  parsed: ParsedTvMetadata[],
  file: FileObject,
  renameSettings: RenameSettings,
  showAll?: boolean,
): ProcessedMatch[] {
  const ext = file.filename.substring(file.filename.lastIndexOf('.') + 1);
  const results = orderBy(
    parsed.map((ep) => {
      const filename = renameSettings.replaceInEpisodes?.trim()
        ? file.filename.replace(
            new RegExp(renameSettings.replaceInEpisodes, 'ig'),
            '',
          )
        : file.filename;
      const prevNormFilename = filename
        .substring(0, filename.lastIndexOf('.'))
        .trim();
      const episodeName = ep.name.trim();
      const rawDistance = distance(
        prevNormFilename.trim().toLowerCase(),
        episodeName.toLowerCase(),
      );
      const tagOrSpecialTag =
        ep.seasonNumber === 0
          ? 'S00E' + (ep.episodeNumber < 10 ? '0' : '') + ep.episodeNumber
          : ep.tag;
      const newFilename = transformPattern(
        renameSettings.fileTemplate || '{tag} - {name}.{ext}',
        {
          ...ep,
          name: episodeName.replace(/[~"#%&*:<>?/\\{|}]+/g, ''),
          ext: ext,
          tag: tagOrSpecialTag,
        },
      ).trim();
      const bestDistance =
        renameSettings.useTagAsSource &&
        prevNormFilename.toLowerCase().includes(tagOrSpecialTag.toLowerCase())
          ? 0
          : distance(
              prevNormFilename.toLowerCase(),
              newFilename
                .toLowerCase()
                .substring(0, newFilename.lastIndexOf('.'))
                .trim(),
            );
      const newFolderName = transformPattern(
        +ep.seasonNumber === 0
          ? 'Specials'
          : renameSettings.folderTemplate?.trim() || 'Season {seasonNumber}',
        { ...ep },
      );
      return {
        episode: ep,
        file,
        distance: bestDistance,
        prevNormFilename,
        newFilename,
        rawDistance: rawDistance,
        newFolderName: newFolderName,
        tagChanged: !prevNormFilename
          .toLowerCase()
          .includes(tagOrSpecialTag.toLowerCase()),
        oldRelativePath: file.path.substring(
          file.path.lastIndexOf(
            file.relativePath.substring(file.relativePath.indexOf('/')),
          ) + 1,
        ),
        newRelativePath: newFolderName + '/' + newFilename,
      };
    }),
    ['distance', 'episode.tag'],
    ['asc', 'asc'],
  );

  return showAll ? results : results.slice(0, 5);
}

export function buildRenamingList(
  episodeMatches: ProcessedMatch[][],
  selectionSet: Set<string>,
  overrides: Record<string, ProcessedMatch>,
): TransformedPaths[] {
  if (selectionSet.size === 0) {
    return [];
  }

  return episodeMatches
    .filter((list) => selectionSet.has(list[0].file.filename))
    .map((list) => {
      const override = overrides[list[0].file.filename];
      const match = override ?? list[0];
      const oldPath = match.file.path;
      const prevRoot = oldPath.substring(
        0,
        oldPath.lastIndexOf(
          match.file.relativePath.substring(
            match.file.relativePath.indexOf('/'),
          ),
        ),
      );
      const newPath =
        prevRoot + '/' + match.newFolderName + '/' + match.newFilename;
      return {
        id: match.file.filename,
        oldPaths: [oldPath],
        newPaths: [newPath],
        changed: match.distance > 0 || oldPath !== newPath,
      };
    });
}
