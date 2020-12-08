
let pgtransfer = require('./transfer');
    let coordinates = await pgtransfer.getTransferById("92e440f0-3963-11eb-bd01-45cbc52b5303");
    coordinates = coordinates.features[0];
    console.log(coordinates.transferLat);
    console.log(coordinates.transferLon);
