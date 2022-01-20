/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { Field } from '../fields/Field';
import { FieldEnum } from '../fieldtypes/FieldEnum';
import { IFIXParser } from '../IFIXParser';
import { Message } from '../message/Message';
import { heartBeat } from '../messagetemplates/MessageTemplates';
import { log } from '../util/util';

export const handleTestRequest = (parser: IFIXParser, message: Message): void => {
    let heartBeatMessage: Message = heartBeat(parser);
    const testReqIdValue: string | null = message.getField(FieldEnum.TestReqID)
        ? String(message.getField(FieldEnum.TestReqID)!.value)
        : null;
    if (testReqIdValue) {
        const testReqId: Field = new Field(FieldEnum.TestReqID, testReqIdValue);
        heartBeatMessage = heartBeat(parser, testReqId);
        parser.send(heartBeatMessage);
        log(
            `${
                parser.parserName
            } (${parser.protocol!.toUpperCase()}): >> responded to TestRequest with Heartbeat<TestReqID=${testReqIdValue}>`,
        );
    } else {
        parser.send(heartBeatMessage);
        log(`${parser.parserName} (${parser.protocol!.toUpperCase()}): >> responded to TestRequest with Heartbeat`);
    }
};
