/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { ISpecMessages, MESSAGES } from '../../spec/SpecMessages';
import { Field } from '../fields/Field';
import { Message } from '../message/Message';
import { MessageContents } from '../messagecontents/MessageContents';

export class Messages {
    public messages: ISpecMessages[] = MESSAGES;
    public messageContents: MessageContents = new MessageContents();
    public cacheMap: Map<string, ISpecMessages> = new Map<string, ISpecMessages>();

    constructor() {
        this.messages.forEach((message: ISpecMessages) => {
            this.cacheMap.set(message.MsgType, message);
        });
    }

    public setMessageType(message: Message, field: Field): void {
        const messageType = this.cacheMap.get(field.value as string);
        if (messageType) {
            message.setDescription(messageType.Name);
            message.setMessageType(messageType.MsgType);
            this.messageContents.processMessageContents(message, messageType.ComponentID);
        }
    }

    public setMessageSequence(message: Message, messageSequence: number): void {
        message.setMessageSequence(messageSequence);
    }
}
