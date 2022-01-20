/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { FIELDS, ISpecFields } from '../../spec/SpecFields';
import { FieldEnum } from '../fieldtypes/FieldEnum';
import { Message } from '../message/Message';
import { Messages } from '../messages/Messages';
import { Categories } from './categories/Categories';
import { DataTypes } from './datatypes/Datatypes';
import { Field } from './Field';
import { Sections } from './sections/Sections';

export class Fields {
    public fields: ISpecFields[] = FIELDS;
    public cacheMap: Map<number, ISpecFields> = new Map<number, ISpecFields>();
    public messages: Messages = new Messages();
    public categories: Categories = new Categories();
    public sections: Sections = new Sections();
    public dataTypes: DataTypes = new DataTypes();

    constructor() {
        this.fields.forEach((item: ISpecFields) => {
            this.cacheMap.set(Number(item.Tag) >> 0, item);
        });
    }

    public processField(message: Message, field: Field): void {
        const data = this.cacheMap.get(field.tag);
        if (data) {
            if (field.tag === FieldEnum.MsgType) {
                this.messages.setMessageType(message, field);
            }
            if (field.tag === FieldEnum.MsgSeqNum) {
                this.messages.setMessageSequence(message, Number(field.value));
            }

            field.setName(data.Name);
            field.setDescription(data.Description);

            if (data.BaseCategory) {
                this.categories.processCategory(field, data.BaseCategory);

                if (field.category!.sectionID) {
                    this.sections.processSection(field, field.category!.sectionID);
                }
            }

            this.dataTypes.processDatatype(field, data.Type);
        } else {
            field.setType(null);
            field.setValue(field.value);
        }
    }
}
