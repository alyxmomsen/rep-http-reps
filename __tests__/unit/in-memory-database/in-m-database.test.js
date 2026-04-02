const { DataBase } = require("../../../app/services/database/database");
const { ResolveSuccessError } = require("../../../app/utils/success-error-resolver/model/suc-err-res");

describe('in-memory database', () => {

    /**
     * @type {DataBase}
     */
    let db;

    /**
     * @type {ResolveSuccessError}
     */
    let succErr;

    beforeEach(() => {

        db = new DataBase();

        succErr = new ResolveSuccessError();
        succErr.addSuccessResolver((suc) => {
            console.log(`im suc-er`, suc);
        });
    });

    test('correct data will be correct handled', () => {

        db.createOne('mytable', {foo:'bar'});

        const response = db.readAll('mytable');

        succErr.handle(response);

        // expect(response).toHaveLength(1);
        expect(response).toHaveProperty('success');
        expect(response.success).toHaveProperty('tableRows');
        expect(response.success.tableRows instanceof Map).toBe(true);
    });

    test('13', () => {

        const responses = [];

        const tableId = 'another table';

        const arr = ['foo', {bar:'baz'}, 13, true, {}, []] ;

        expect(() => responses.push(db.createOne(tableId, arr[0]))).toThrow();
        expect(() => responses.push(db.createOne(tableId, arr[1]))).not.toThrow();
        expect(() => responses.push(db.createOne(tableId, arr[2]))).toThrow();
        expect(() => responses.push(db.createOne(tableId, arr[3]))).toThrow();
        expect(() => responses.push(db.createOne(tableId, arr[4]))).not.toThrow();
        expect(() => responses.push(db.createOne(tableId, arr[5]))).not.toThrow();
        
        const data =  db.readAll(tableId);
        
        console.dir(data, {depth:10});

    });



});


