import fsExtra from 'fs-extra';
import path from 'path';

import { ILibraryName, LibraryName } from 'h5p-nodejs-library';

/**
 * Looks for libraries in a base directory.
 */
export class LibraryDirectoryMapper {
    /**
     * @param baseDir The base directory in which all libraries are stored
     */
    constructor(private baseDir: string) {}

    private map: { [key: string]: string } = {};

    /**
     * Scans the base directory for the library and returns a path.
     * @param library the library to look for
     * @returns the absolute path to the library directory or undefined if it wasn't found
     */
    public getDirectory(library: ILibraryName): string {
        const uberName = LibraryName.toUberName(library);
        const cachedDirectory = this.map[uberName];
        if (
            cachedDirectory &&
            fsExtra.pathExistsSync(path.join(cachedDirectory, 'library.json'))
        ) {
            return cachedDirectory;
        }

        this.map[uberName] = undefined;
        const dirs = fsExtra.readdirSync(this.baseDir);
        for (const dir of dirs) {
            const libraryPath = path.join(this.baseDir, dir);
            const libraryJsonPath = path.join(libraryPath, 'library.json');
            if (!fsExtra.pathExistsSync(libraryJsonPath)) {
                continue;
            }
            const libraryMetadata: ILibraryName = fsExtra.readJSONSync(
                libraryJsonPath
            );
            if (LibraryName.equal(libraryMetadata, library)) {
                this.map[uberName] = libraryPath;
                return libraryPath;
            }
        }
        return undefined;
    }
}
