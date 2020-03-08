import bodyParser from 'body-parser';
import express from 'express';
import fileUpload from 'express-fileupload';
import i18next from 'i18next';
import i18nextExpressMiddleware from 'i18next-express-middleware';
import i18nextNodeFsBackend from 'i18next-node-fs-backend';
import os from 'os';
import path from 'path';
import * as H5P from 'h5p-nodejs-library';

import expressRoutes from './expressRoutes';
import startPageRenderer from './startPageRenderer';
import User from './User';
import { DevLibraryStorage } from '../DevLibraryStorage';
import { SingleDirectoryStorage } from '../SingleDirectoryStorage';
import { MultiDirectoryLibraryStorage } from '../MultiDirectoryLibraryStorage';

/**
 * Displays links to the server at all available IP addresses.
 * @param port The port at which the server can be accessed.
 */
function displayIps(port: string): void {
    // tslint:disable-next-line: no-console
    console.log('Example H5P NodeJs server is running:');
    const networkInterfaces = os.networkInterfaces();
    // tslint:disable-next-line: forin
    for (const devName in networkInterfaces) {
        networkInterfaces[devName]
            .filter(int => !int.internal)
            .forEach(int =>
                // tslint:disable-next-line: no-console
                console.log(
                    `http://${int.family === 'IPv6' ? '[' : ''}${int.address}${
                        int.family === 'IPv6' ? ']' : ''
                    }:${port}`
                )
            );
    }
}

const start = async () => {
    await i18next
        .use(i18nextNodeFsBackend)
        .use(i18nextExpressMiddleware.LanguageDetector)
        .init({
            backend: {
                loadPath: 'src/example/assets/translations/{{ns}}/{{lng}}.json'
            },
            debug: process.env.DEBUG && process.env.DEBUG.includes('i18n'),
            defaultNS: 'server',
            fallbackLng: 'en',
            ns: ['server', 'storage-file-implementations'],
            preload: ['en']
        });

    const devStorage = new DevLibraryStorage(
        path.resolve('tests/test-data/dev')
    );
    const singleStorage = new SingleDirectoryStorage(
        path.resolve('tests/test-data/single')
    );
    const regularStorage = new H5P.fsImplementations.FileLibraryStorage(
        path.resolve('tests/test-data/temp')
    );
    const complexLibraryStorage = new MultiDirectoryLibraryStorage(
        regularStorage,
        singleStorage,
        devStorage,
        regularStorage
    );

    const h5pEditor = new H5P.H5PEditor(
        new H5P.fsImplementations.InMemoryStorage(),
        await new H5P.EditorConfig(
            new H5P.fsImplementations.JsonStorage(
                path.resolve('src/example/config.json')
            )
        ).load(),
        complexLibraryStorage,
        new H5P.fsImplementations.FileContentStorage(path.resolve('content')),
        new H5P.fsImplementations.DirectoryTemporaryFileStorage(path.resolve('temp'))
    );

    const server = express();

    server.use(bodyParser.json());
    server.use(
        bodyParser.urlencoded({
            extended: true
        })
    );
    server.use(
        fileUpload({
            limits: { fileSize: 50 * 1024 * 1024 }
        })
    );

    server.use((req, res, next) => {
        req.user = new User();
        next();
    });

    server.use(i18nextExpressMiddleware.handle(i18next));

    server.use(
        h5pEditor.config.baseUrl,
        H5P.adapters.express(
            h5pEditor,
            path.resolve('h5p/core'), // the path on the local disc where the files of the JavaScript client of the player are stored
            path.resolve('h5p/editor') // the path on the local disc where the files of the JavaScript client of the editor are stored
        )
    );

    server.use(h5pEditor.config.baseUrl, expressRoutes(h5pEditor));

    server.get('/', startPageRenderer(h5pEditor));

    const port = process.env.PORT || '8080';
    displayIps(port);
    server.listen(port);
};

start();
