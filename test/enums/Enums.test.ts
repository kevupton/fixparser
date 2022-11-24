import { Enums } from '../../src/enums/Enums';

describe('Enums', () => {
    const expected = {
        Group: '',
        Description: 'Partial decline of OrderQty (e.g. exchange initiated partial cancel)',
        added: 'FIX.4.2',
        Value: '5',
        Sort: 5,
        Tag: 378,
        SymbolicName: 'PartialDeclineOfOrderQty',
    };

    it('should return a new class containing cache maps', () => {
        const instance = new Enums();
        expect(instance.cacheMap.size).toBeGreaterThan(1);
    });
    it('should get enum by tag and value as number', () => {
        const instance = new Enums();
        const component = instance.getEnum('378', 5);
        expect(component).toEqual(expected);
    });
    it('should get enum by tag and value as string', () => {
        const instance = new Enums();
        const component = instance.getEnum('378', '5');
        expect(component).toEqual(expected);
    });
    it('should return undefined if not found', () => {
        const instance = new Enums();
        const component = instance.getEnum('aaaaa', 'bbbbb');
        expect(component).toBeUndefined();
    });
});
