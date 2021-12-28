var fs = require('fs');

readJson = function(fname){
    let rawdata = fs.readFileSync(fname);
    let jsonobj = JSON.parse(rawdata);
    return jsonobj;
}

module.exports = {
    readJson: readJson,
}
