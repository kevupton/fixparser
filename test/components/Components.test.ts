import { Components } from '../../src/components/Components';

describe('Components', () => {
    const expected = {
        CategoryID: 'Common',
        ComponentType: 'ImplicitBlockRepeating',
        Description: '',
        added: 'FIX.4.4',
        AbbrName: 'IOI',
        NotReqXML: 0,
        ComponentID: 2020,
        Name: 'InstrmtLegIOIGrp',
    };

    it('should return a new class containing cache maps', () => {
        const instance = new Components();
        expect(instance.cacheMap.size).toBeGreaterThan(1);
        expect(instance.cacheMapByName.size).toBeGreaterThan(1);
    });
    it('should find by id', () => {
        const instance = new Components();
        const component = instance.find(2020);
        expect(component).toEqual(expected);
    });
    it('should find by name', () => {
        const instance = new Components();
        const component = instance.findByName('InstrmtLegIOIGrp');
        expect(component).toEqual(expected);
    });
    it('should return undefined if not found - find', () => {
        const instance = new Components();
        const component = instance.find(11223344);
        expect(component).toBeUndefined();
    });
    it('should return undefined if not found - findByName', () => {
        const instance = new Components();
        const component = instance.findByName('aaaaa');
        expect(component).toBeUndefined();
    });
});
