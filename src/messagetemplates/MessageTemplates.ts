/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { Field } from '../fields/Field';
import { FieldEnum } from '../fieldtypes/FieldEnum';
import { MessageEnum } from '../fieldtypes/MessageEnum';
import { IFIXParser } from '../IFIXParser';
import { LicenseManager } from '../licensemanager/LicenseManager';
import { Message } from '../message/Message';

export const heartBeat = (parser: IFIXParser, testReqId?: Field): Message => {
    if (!LicenseManager.validateLicense()) {
        return new Message();
    }
    const fields: Field[] = [
        new Field(FieldEnum.BeginString, parser.fixVersion),
        new Field(FieldEnum.MsgType, MessageEnum.Heartbeat),
        new Field(FieldEnum.MsgSeqNum, parser.getNextTargetMsgSeqNum()),
        new Field(FieldEnum.SenderCompID, parser.sender),
        new Field(FieldEnum.TargetCompID, parser.target),
        new Field(FieldEnum.SendingTime, parser.getTimestamp(new Date())),
    ];

    if (testReqId) {
        fields.push(testReqId);
    }

    return parser.createMessage(...fields);
};
