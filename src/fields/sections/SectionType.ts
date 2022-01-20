/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { ISpecSections } from '../../../spec/SpecSections';

export class SectionType {
    public sectionID: string | null = null;
    public name: string | null = null;
    public displayOrder: number | null = null;
    public volume: string | null = null;
    public notReqXML: boolean | null = null;
    public fixmlFileName: string | null = null;
    public description: string | null = null;

    public reset(): void {
        this.sectionID = null;
        this.name = null;
        this.displayOrder = null;
        this.volume = null;
        this.notReqXML = null;
        this.fixmlFileName = null;
        this.description = null;
    }

    public setSection(section: ISpecSections): void {
        this.sectionID = section.SectionID;
        this.name = section.Name;
        this.displayOrder = section.DisplayOrder;
        this.volume = section.Volume;
        this.notReqXML = section.NotReqXML === 1;
        this.fixmlFileName = section.FIXMLFileName;
        this.description = section.Description;
    }
}
