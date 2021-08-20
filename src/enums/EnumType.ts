/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright 2021 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { ISpecEnums } from './../../spec/SpecEnums';

export class EnumType {
    public tag: string | null = null;
    public value: string | null = null;
    public symbolicName: string | null = null;
    public group: string | null = null;
    public sort: string | null = null;
    public description: string | null = null;
    public elaboration: string | null = null;
    public added: string | null = null;

    public setEnumeration(enumType: ISpecEnums): void {
        this.tag = enumType.Tag;
        this.value = enumType.Value;
        this.symbolicName = enumType.SymbolicName ? enumType.SymbolicName : null;
        this.group = enumType.Group ? enumType.Group : null;
        this.sort = enumType.Sort ? enumType.Sort : null;
        this.description = enumType.Description ? enumType.Description : null;
        this.elaboration = enumType.Elaboration ? enumType.Elaboration : null;
        this.added = enumType.Added ? enumType.Added : null;
    }
}
