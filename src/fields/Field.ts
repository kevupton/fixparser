/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { EnumType } from '../enums/EnumType';
import { CategoryType } from './categories/CategoryType';
import { FieldType } from './datatypes/FieldType';
import { SectionType } from './sections/SectionType';

export class Field {
    public tag: number;
    public value: number | string | boolean | null;
    public name: string | null = null;
    public description: string | null = null;
    public type: FieldType | null = null;
    public category: CategoryType | null = null;
    public section: SectionType | null = null;
    public enumeration: EnumType | null = null;
    public validated: boolean = false;

    constructor(tag: number, value: number | string | boolean | null) {
        this.tag = tag >> 0;
        this.value = value;
        this.name = null;
        this.description = null;
        this.type = null;
        this.category = null;
        this.section = null;
        this.enumeration = null;
        this.validated = false;
    }

    public setTag(tag: number): void {
        this.tag = tag >> 0;
    }

    public setValue(value: number | string | boolean | null): void {
        this.value = value;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public setDescription(description: string): void {
        this.description = description;
    }

    public setType(type: FieldType | null): void {
        this.type = type;
    }

    public setCategory(category: CategoryType): void {
        this.category = category;
    }

    public setSection(section: SectionType): void {
        this.section = section;
    }

    public setEnumeration(enumeration: EnumType): void {
        this.enumeration = enumeration;
    }

    public setValidated(isValid: boolean): void {
        this.validated = isValid;
    }

    public toString(): string {
        return `${this.tag}=${this.value}`;
    }
}
