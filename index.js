( async () => {
    const mergeImages = require('merge-images');
    const { Canvas, Image } = require('canvas');
    const fs = require('fs');

    const imgPath = process.argv.pop();
    const filePaths = [];
    let counter = 0;

    const folders = fs.readdirSync(imgPath);
    for (let index = 0; index < folders.length; index++) {
        const folder = folders[index];
        const files = fs.readdirSync(`${imgPath}/${folder}`);
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            filePaths.push(`${imgPath}/${folder}/${file}`);
        }
    }

    mergeThem(filePaths);

    async function mergeThem(files){
        counter++;
        if(counter == 10){
            await sleep(10000);
            counter = 0;
        }
        const file = files.pop();
        
        if(fs.existsSync(`${file.replace(".JPG", "_.JPG")}`)){
            console.info("Skippimg file", file);
            return mergeThem(files);
        }
        console.log(file);

        const b64 = await mergeImages([`${file}`, './logo.png'], {
            Canvas: Canvas,
            Image: Image
        });

        const b64Image = b64.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(b64Image, 'base64');
        fs.writeFileSync(`${file.replace(".JPG", "_.JPG")}`, imageBuffer);

        mergeThem(files);

    }

    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
})();