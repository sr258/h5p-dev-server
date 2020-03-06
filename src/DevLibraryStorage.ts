import {
    fsImplementations,
    ILibraryName,
    LibraryName
} from 'h5p-nodejs-library';
import * as path from 'path';

import { LibraryDirectoryMapper } from './LibraryDirectoryMapper';

/**
 * Similar to FileLibraryStorage but is tolerant of directory names of libraries.
 */
export class DevLibraryStorage extends fsImplementations.FileLibraryStorage {
    constructor(private devLibrariesDirectory: string) {
        super(devLibrariesDirectory);
        this.mapper = new LibraryDirectoryMapper(devLibrariesDirectory);
        this.ignoredFilePatterns = [new RegExp('package.json')];
    }

    private mapper: LibraryDirectoryMapper;

    protected getDirectoryPath(library: ILibraryName): string {
        const p = this.mapper.getDirectory(library);
        if (!p) {
            throw new Error(
                `Library ${LibraryName.toUberName(library)} not installed in ${
                    this.devLibrariesDirectory
                }`
            );
        }
        return p;
    }

    protected getFilePath(library: ILibraryName, filename: string): string {
        const dir = this.getDirectoryPath(library);
        return path.join(dir, filename);
    }
}
