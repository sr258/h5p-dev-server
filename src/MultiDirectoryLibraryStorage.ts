import { Stream } from 'stream';
import { ReadStream } from 'fs';
import {
    fsImplementations,
    ILibraryStorage,
    ILibraryName,
    ILibraryMetadata,
    IInstalledLibrary,
    LibraryName
} from 'h5p-nodejs-library';
import { DevLibraryStorage } from './DevLibraryStorage';

/**
 * Aggregates several libraries directories. All write access is sent to the directory
 * specified in the constructor. When libraries or files are read, the readDirectories are
 * tried in the order of the list passed to the constructor.
 *
 * Note that the writeDirectory can also occur in the read directory list!
 */
export class MultiDirectoryLibraryStorage implements ILibraryStorage {
    /**
     * @param writeDirectory an absolute path to the write directory
     * @param readDirectories absolute paths to the read directories
     */
    constructor(writeDirectory: string, ...readDirectories: string[]) {
        this.writeStorage = new fsImplementations.FileLibraryStorage(
            writeDirectory
        );
        this.readStorages = readDirectories.map(
            readDirectory => new DevLibraryStorage(readDirectory)
        );
    }

    private readStorages: ILibraryStorage[];
    private writeStorage: ILibraryStorage;

    public addLibraryFile(
        library: ILibraryName,
        fileLocalPath: string,
        readStream: Stream
    ): Promise<boolean> {
        return this.writeStorage.addLibraryFile(
            library,
            fileLocalPath,
            readStream
        );
    }

    public clearLibraryFiles(library: ILibraryName): Promise<void> {
        return this.clearLibraryFiles(library);
    }

    public async fileExists(
        library: ILibraryName,
        filename: string
    ): Promise<boolean> {
        return (await this.findReadStorage(library)).fileExists(
            library,
            filename
        );
    }

    public async getFileStream(
        library: ILibraryName,
        file: string
    ): Promise<ReadStream> {
        return (await this.findReadStorage(library)).fileExists(library, file);
    }

    public async getInstalled(
        ...machineNames: string[]
    ): Promise<ILibraryName[]> {
        return (
            await Promise.all(
                this.readStorages.map(storage =>
                    storage.getInstalled(...machineNames)
                )
            )
        )
            .reduce((prevArray, currentArray) => {
                return prevArray.concat(currentArray);
            }, [])
            .reduce((prevLib, currentLib) => {
                if (!prevLib.some(lib => LibraryName.equal(lib, currentLib))) {
                    prevLib.push(currentLib);
                }
                return prevLib;
            }, []);
    }

    public async getLanguageFiles(library: ILibraryName): Promise<string[]> {
        return (await this.findReadStorage(library)).getLanguageFiles(library);
    }

    public installLibrary(
        libraryData: ILibraryMetadata,
        restricted: boolean
    ): Promise<IInstalledLibrary> {
        return this.writeStorage.installLibrary(libraryData, restricted);
    }

    public async libraryExists(name: ILibraryName): Promise<boolean> {
        try {
            await this.findReadStorage(name);
        } catch (error) {
            return false;
        }
        return true;
    }

    public async listFiles(library: ILibraryName): Promise<string[]> {
        return (await this.findReadStorage(library)).listFiles(library);
    }

    public removeLibrary(library: ILibraryName): Promise<void> {
        return this.writeStorage.removeLibrary(library);
    }

    public updateLibrary(
        libraryMetadata: ILibraryMetadata
    ): Promise<IInstalledLibrary> {
        return this.writeStorage.updateLibrary(libraryMetadata);
    }

    /**
     * Looks through all read storages and returns the first one containing the library.
     * Note that it only checks major and minor version of the library and not the patch version!
     * @param library the library to find
     */
    private async findReadStorage(
        library: ILibraryName
    ): Promise<ILibraryStorage> {
        const storage = this.readStorages.find(st => st.libraryExists(library));
        if (!storage) {
            throw new Error(
                `Library ${LibraryName.toUberName(
                    library
                )} not found in read storage`
            );
        }
        return storage;
    }
}
