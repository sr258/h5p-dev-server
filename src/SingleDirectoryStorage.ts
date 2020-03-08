import {
    fsImplementations,
    ILibraryName,
    LibraryName
} from 'h5p-nodejs-library';
import fsExtra from 'fs-extra';
import path from 'path';

/**
 * A library storage that is only contains exactly one library in a single directory.
 */
export class SingleDirectoryStorage extends fsImplementations.FileLibraryStorage {
    constructor(private singleDirectory: string) {
        super(singleDirectory);
        if (
            !fsExtra.pathExistsSync(path.join(singleDirectory, 'library.json'))
        ) {
            throw new Error(
                `Directory ${singleDirectory} must contain a library.json file`
            );
        }
        this.ignoredFilePatterns = [new RegExp('package.json')];
    }

    public async libraryExists(library: ILibraryName): Promise<boolean> {
        const d = this.getDirectoryPath(library);
        return d !== undefined;
    }

    protected getDirectoryPath(library: ILibraryName): string {
        const libraryMetadata: ILibraryName = fsExtra.readJSONSync(
            path.join(this.singleDirectory, 'library.json')
        );
        if (LibraryName.equal(library, libraryMetadata)) {
            return this.singleDirectory;
        }

        return undefined;
    }

    protected getFilePath(library: ILibraryName, filename: string): string {
        const dir = this.getDirectoryPath(library);
        if (!dir) {
            return undefined;
        }
        return path.join(dir, filename);
    }
}
