import fs from 'fs';

import { ISpecMessageContents, MESSAGE_CONTENTS } from '../spec/SpecMessageContents';
import { Components } from '../src/components/Components';

const messageContents: ISpecMessageContents[] = MESSAGE_CONTENTS;
const components: Components = new Components();
const mappedComponents: any = {};
const messageContentsById: any = messageContents.reduce((groups: any, item: ISpecMessageContents) => {
    const key: number = item.ComponentID;
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
}, {});

console.log('Building message content cache map...');
messageContents.forEach((messageContent) => {
    const componentsById = messageContentsById[messageContent.ComponentID];
    mappedComponents[messageContent.ComponentID] = componentsById.map((component: ISpecMessageContents) => ({
        componentID: component.ComponentID,
        tagText: component.TagText,
        indent: component.Indent,
        position: component.Position,
        reqd: component.Reqd,
        description: component.Description,
        added: component.added,
        addedEP: component.addedEP,
        deprecated: component.deprecated,
        validated: false,
        components: components.findByName(String(component.TagText))
            ? messageContents
                  .filter(
                      (content) =>
                          content.ComponentID === components.findByName(String(component.TagText))!.ComponentID,
                  )
                  .map((childComponent) => ({
                      componentID: childComponent.ComponentID,
                      tagText: childComponent.TagText,
                      indent: childComponent.Indent,
                      position: childComponent.Position,
                      reqd: childComponent.Reqd,
                      description: childComponent.Description,
                      added: childComponent.added,
                      addedEP: childComponent.addedEP,
                      deprecated: childComponent.deprecated,
                      validated: false,
                  }))
            : [],
    }));
});

const outputPath = 'prebuild/';
const outputFilename = `${outputPath}MessageContents.prebuilt.json`;
console.log(`Built message content cache map, writing to ${outputFilename}.`);

if (!fs.existsSync(outputPath)) {
    try {
        fs.mkdirSync(outputPath);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

if (fs.existsSync(outputFilename)) {
    fs.unlinkSync(outputFilename);
}

try {
    fs.writeFileSync(outputFilename, JSON.stringify(mappedComponents), 'utf8');
} catch (error) {
    console.error(error);
    process.exit(2);
}

console.log('Prebuild step done.');
