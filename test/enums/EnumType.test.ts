import { EnumType } from '../../src/enums/EnumType';
import { ISpecEnums } from '../../spec/SpecEnums';

describe('EnumType', () => {
    const input: ISpecEnums = {
        Tag: 123,
        Value: 'value',
        SymbolicName: 'symbolic name',
        Group: 'group',
        Sort: 5,
        Description: 'description',
        Elaboration: 'elaboration',
        added: 'added in version',
    };

    it('should set values', () => {
        const instance = new EnumType();
        instance.setEnumeration(input);
        expect(instance.tag).toEqual(input.Tag);
        expect(instance.value).toEqual(input.Value);
        expect(instance.symbolicName).toEqual(input.SymbolicName);
        expect(instance.group).toEqual(input.Group);
        expect(instance.sort).toEqual(input.Sort);
        expect(instance.description).toEqual(input.Description);
        expect(instance.elaboration).toEqual(input.Elaboration);
        expect(instance.added).toEqual(input.added);
    });
});
