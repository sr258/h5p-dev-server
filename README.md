# H5P Development Server

## Ideas

- Can be installed as a NPM development dependency of a H5P library. Is then called with 'npx h5p-dev-server'.
- The H5P library it is installed in is the one that is opened when the server starts.
- All H5P dependencies of the main H5P library can be installed using 'npx h5p-dev-server install'. This will download all libraries into `h5p_libraries` from a central repository.
- The dev server offers transparent access to the main library and installed dependent libraries.
- The dev server allows using peer h5p libraries by calling it with 'npx h5p-dev-server --peer PATH'. The library in the directory can then be accessed like a regular library (but still developed).
- There is no caching in the dev server.
- The dev server can be started with a test directory as argument. The content in the directory can then be accessed at localhost:8080/tests/XYZ. This is meant to simplify automated integration tests.
- The dev server allows creating, editing and displaying H5P content of the main library. The content is stored in a special directory (test-temp).
- The dev server captures and displays xAPI statements.
- The dev server allows debugging JavaScript from IDEs.