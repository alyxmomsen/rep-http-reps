const {
    FileManager,
} = require('../../../app/services/filemanager.service.js/filemanager.service');
const {
    filemanager,
} = require('../../../app/services/filemanager.service.js/fmanager.controller');
const {
    ResolveSuccessError,
} = require('../../../app/utils/success-error-resolver/model/suc-err-res');

describe('file  manager', () => {
    /**
     * @type {FileManager}
     */
    let fmanager;

    /**
     * @type {ResolveSuccessError}
     */
    let succerr;

    /**
     * @type {(success:Object) => Promise<any>}
     */
    let mockOnSuccess;
    /**
     * @type {(error:Object) => Promise<any>}
     */
    let mockOnError;
    /**
     * @type {() => Pomise<any>}
     */
    let mockOnBadResponseHandler; // no

    beforeEach(() => {
        fmanager = new FileManager();
        succerr = new ResolveSuccessError();

        mockOnSuccess = jest.fn(() => {
            console.log(`\x1b[32mSUCCESS\x1b[0m`);
        });

        succerr.addSuccessResolver(mockOnSuccess);

        succerr.addErrorResolver((err) => {
            console.log(`\x1b[33mERROR\x1b[0m`);
        });

        succerr.onBadResponse(() => {
            console.log(`\x1b[31mNO SUCCESS\x1b[0m`);
        });
    });

    afterEach(() => {});

    test('default', async () => {
        const result = await fmanager.write(Buffer.from('foo bar baz'));

        console.log({ result });

        await succerr.handle(result);
        expect(mockOnSuccess).toHaveBeenCalled();
    });

    test('returs the same data as those was been stored like', async () => {
        const fakeFileData = 'have bean cold';

        const result = await fmanager.write(Buffer.from(fakeFileData));

        await succerr.handle(result);

        expect(mockOnSuccess).toHaveBeenCalled();
        expect(result).toHaveProperty('success');
        expect(result.success).toHaveProperty('filename');
        expect(result.success.filename.length).toBe(64);

        const filename = result.success.filename;

        const readResult = await fmanager.read(filename);

        await succerr.handle(readResult);

        expect(readResult).toHaveProperty('success');
        expect(readResult.success).toHaveProperty('readStream');

        const data = await new Promise((res, rej) => {
            const chunks = [];
            readResult.success.readStream.on('data', (chunk) => {
                chunks.push(chunk);
            });

            readResult.success.readStream.on('end', () => {
                const wholeData = Buffer.concat(chunks);
                res(wholeData);
            });
        });

        expect(data).toBeDefined();
        expect(data).toBeInstanceOf(Buffer);

        const str = data.toString('utf-8');

        expect(str).toEqual(fakeFileData);
    });
});
