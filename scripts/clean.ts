import fs from 'fs/promises';
import path from 'path';

const rmrf = async (pathFromRoot: string): Promise<void> => {
    await fs.rm(path.join(__dirname, '../', pathFromRoot), {
        recursive: true,
        force: true,
    });
};

const main = async (): Promise<void> => {
    await Promise.all([rmrf('build'), rmrf('test-reports')]);
};

if (require.main === module) {
    void main();
}
