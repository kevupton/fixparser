/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import prebuiltMap from '../../prebuild/MessageContents.prebuilt.json';
import { ISpecMessageContents } from '../../spec/SpecMessageContents';
import { Message } from '../message/Message';

export class MessageContents {
    public cacheMap: Map<number, ISpecMessageContents[]> = new Map<number, ISpecMessageContents[]>();
    public validated: boolean = false;

    constructor() {
        Object.entries(prebuiltMap).forEach((pair) =>
            this.cacheMap.set(Number(pair[0]), pair[1] as unknown as ISpecMessageContents[]),
        );
    }

    public processMessageContents(message: Message, componentId: number): void {
        const messageContents = this.cacheMap.get(componentId);
        if (messageContents) {
            message.setMessageContents(messageContents);
        }
    }
}
