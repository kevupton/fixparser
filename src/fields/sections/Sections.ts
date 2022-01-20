/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { ISpecSections, SECTIONS } from '../../../spec/SpecSections';
import { Field } from '../Field';
import { SectionType } from './SectionType';

export class Sections {
    public sections: ISpecSections[] = SECTIONS;
    public cacheMap: Map<string, ISpecSections> = new Map<string, ISpecSections>();
    public sectionType: SectionType = new SectionType();

    constructor() {
        this.sections.forEach((section) => {
            this.cacheMap.set(section.SectionID, section);
        });
    }

    public processSection(item: Field, sectionId: string): void {
        this.sectionType.reset();
        const sectionData: ISpecSections | undefined = this.cacheMap.get(sectionId);
        if (sectionData) {
            this.sectionType.setSection(sectionData);
            item.setSection(this.sectionType);
        }
    }
}
