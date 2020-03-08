import * as H5P from 'h5p-nodejs-library';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
import * as tmp from 'tmp-promise';

import { MultiDirectoryLibraryStorage } from '../src/MultiDirectoryLibraryStorage';
import { DevLibraryStorage } from '../src/DevLibraryStorage';
import { SingleDirectoryStorage } from '../src/SingleDirectoryStorage';

describe('MultiDirectoryLibraryStorage', () => {
    const dataPath = path.resolve('tests/test-data');

    let devStorage: H5P.ILibraryStorage;
    let singleStorage: H5P.ILibraryStorage;
    let regularStorage: H5P.ILibraryStorage;
    let complexLibraryStorage: H5P.ILibraryStorage;
    let tmpDir: string;

    beforeEach(async () => {
        const dirResult = await tmp.dir();
        tmpDir = dirResult.path;
        await fsExtra.copy(dataPath, tmpDir, { recursive: true });

        devStorage = new DevLibraryStorage(path.join(tmpDir, 'dev'));
        singleStorage = new SingleDirectoryStorage(path.join(tmpDir, 'single'));
        regularStorage = new H5P.fsImplementations.FileLibraryStorage(
            path.join(tmpDir, 'temp')
        );
        complexLibraryStorage = new MultiDirectoryLibraryStorage(
            regularStorage,
            singleStorage,
            devStorage,
            regularStorage
        );
    });

    afterEach(async () => {
        await fsExtra.remove(tmpDir);
    });

    it('finds a library in dev storage and can read files from it', async () => {
        const joubelUiName = {
            machineName: 'H5P.JoubelUI',
            majorVersion: 1,
            minorVersion: 3
        };
        await expect(
            complexLibraryStorage.libraryExists(joubelUiName)
        ).resolves.toBe(true);
        await expect(
            complexLibraryStorage.fileExists(joubelUiName, 'library.json')
        ).resolves.toBe(true);
        await expect(
            complexLibraryStorage.listFiles(joubelUiName)
        ).resolves.toMatchObject([
            'css/joubel-help-dialog.css',
            'css/joubel-icon.css',
            'css/joubel-message-dialog.css',
            'css/joubel-progress-circle.css',
            'css/joubel-progressbar.css',
            'css/joubel-score-bar.css',
            'css/joubel-simple-rounded-button.css',
            'css/joubel-slider.css',
            'css/joubel-speech-bubble.css',
            'css/joubel-tip.css',
            'css/joubel-ui.css',
            'fonts/joubel.eot',
            'fonts/joubel.svg',
            'fonts/joubel.ttf',
            'fonts/joubel.woff',
            'js/joubel-help-dialog.js',
            'js/joubel-message-dialog.js',
            'js/joubel-progress-circle.js',
            'js/joubel-progressbar.js',
            'js/joubel-score-bar.js',
            'js/joubel-simple-rounded-button.js',
            'js/joubel-slider.js',
            'js/joubel-speech-bubble.js',
            'js/joubel-throbber.js',
            'js/joubel-tip.js',
            'js/joubel-ui.js',
            'library.json'
        ]);
    });

    it('finds a library in single storage and can read files from it', async () => {
        const joubelUiName = {
            machineName: 'H5P.Blanks',
            majorVersion: 1,
            minorVersion: 12
        };
        await expect(
            complexLibraryStorage.libraryExists(joubelUiName)
        ).resolves.toBe(true);
        await expect(
            complexLibraryStorage.fileExists(joubelUiName, 'library.json')
        ).resolves.toBe(true);
        await expect(
            complexLibraryStorage.listFiles(joubelUiName)
        ).resolves.toMatchObject([
            'css/blanks.css',
            'icon.svg',
            'js/blanks.js',
            'js/cloze.js',
            'language/af.json',
            'language/ar.json',
            'language/bs.json',
            'language/ca.json',
            'language/cs.json',
            'language/da.json',
            'language/de.json',
            'language/el.json',
            'language/es.json',
            'language/et.json',
            'language/eu.json',
            'language/fi.json',
            'language/fr.json',
            'language/he.json',
            'language/hu.json',
            'language/it.json',
            'language/ja.json',
            'language/ko.json',
            'language/nb.json',
            'language/nl.json',
            'language/nn.json',
            'language/pl.json',
            'language/pt-br.json',
            'language/pt.json',
            'language/ro.json',
            'language/ru.json',
            'language/sl.json',
            'language/sma.json',
            'language/sme.json',
            'language/smj.json',
            'language/sr.json',
            'language/sv.json',
            'language/tr.json',
            'language/vi.json',
            'library.json',
            'presave.js',
            'semantics.json',
            'upgrades.js'
        ]);
    });
});
