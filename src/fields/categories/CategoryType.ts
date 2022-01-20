/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { ISpecCategories } from '../../../spec/SpecCategories';

export class CategoryType {
    public categoryID: string | null = null;
    public fixmlFileName: string | null = null;
    public notReqXML: boolean | null = null;
    public generateImplFile: boolean | null = null;
    public componentType: string | null = null;
    public sectionID: string | null = null;
    public volume: number | null = null;
    public includeFile: string | null = null;

    public reset(): void {
        this.categoryID = null;
        this.fixmlFileName = null;
        this.notReqXML = null;
        this.generateImplFile = null;
        this.componentType = null;
        this.sectionID = null;
        this.volume = null;
        this.includeFile = null;
    }

    public setCategory(category: ISpecCategories): void {
        this.categoryID = category.CategoryID;
        this.fixmlFileName = category.FIXMLFileName;
        this.notReqXML = category.NotReqXML === 1;
        this.generateImplFile = category.GenerateImplFile === 1;
        this.componentType = category.ComponentType;
        this.sectionID = category.SectionID!;
        this.volume = category.Volume;
        this.includeFile = category.IncludeFile!;
    }
}
