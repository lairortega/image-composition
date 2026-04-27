( async () => {
    const mergeImages = require('merge-images');
    const { Canvas, Image } = require('canvas');
    const fs = require('fs');
    const path = require('path');

    const outputPath = process.argv.pop();
    const imageFrame = process.argv.pop();
    const imgPath = process.argv.pop();

    const filePaths = getAllFiles(imgPath);
    let counter = 0;

    function getAllFiles(dirPath) {
        const files = [];
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                files.push(...getAllFiles(fullPath));
            } else if (stat.isFile()) {
                files.push(fullPath);
            }
        }
        return files;
    }

    mergeThem(filePaths);

    async function mergeThem(files){
        if(files.length == 0){
            console.log("Done!");
            return;
        }
        counter++;
        if(counter == 10){
            await sleep(10000);
            counter = 0;
        }
        const file = files.pop();
        const fileParts = file.split(".");
        const ext = fileParts.pop();
        const basename = fileParts.pop().split("/").pop();
        const targetFile = file.replace(imgPath, outputPath);
        
        if(fs.existsSync(`${targetFile.replace(`.${ext}`, `_.${ext}`)}`)){
            console.info("Skippimg file", file);
            return mergeThem(files);
        }
        console.log(file);

        const b64 = await mergeImages([`${file}`, imageFrame], {
            Canvas: Canvas,
            Image: Image
        });

        const b64Image = b64.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(b64Image, 'base64');
        fs.mkdirSync(path.dirname(targetFile), { recursive: true });
        fs.writeFileSync(`${targetFile.replace(`.${ext}`, `_.${ext}`)}`, imageBuffer);

        mergeThem(files);
    }

    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
})();