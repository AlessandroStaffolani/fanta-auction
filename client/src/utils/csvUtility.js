
const fs = require('fs');

export function readInputFile(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.readAsText(file);

        reader.onload = (event) => {
            let csv = event.target.result;
            resolve(csv);
        };
        reader.onerror = (event) => {
            if(event.target.error.name === "NotReadableError") {
                reject(event.target.error);
            }
        };
    });
}

export function reformatCsvData(data, role) {
    let newData = [];
    data.forEach(line => {
        newData.push({
            player: line[0],
            team: line[1],
            role
        })
    });

    return newData
}

export function createCsvFile(destination, csvString) {

    console.log(destination, csvString);
    return new Promise((resolve, reject) => {
        fs.writeFile(destination, csvString, function(err) {
            if(err) {
                reject(err);
            }

            resolve(200);
        });
    });
}