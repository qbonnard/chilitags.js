//Set new camera calibration
var cameraCalibrationFileNumber = 1;
function setNewCamera(file) {
    var reader = new FileReader;
    reader.readAsArrayBuffer(file);
    reader.onload = function() {
        var fileName = 'cameraConfiguration' + cameraCalibrationFileNumber;
        var node = FS.createDataFile('/', fileName, new Uint8Array(reader.result), true, true);
        cameraCalibrationFileNumber++;
        Module.ccall('setCameraConfiguration', 'number', ['string'], [fileName]);
    }
}
Module['setNewCamera'] = setNewCamera;

//Return projection matrix
function getProjectionMatrix(width, height, near, far) {
    var buf = Module._malloc(64);
    buf = Module.ccall('getProjectionMatrix', 'number', ['number', 'number', 'number', 'number'], [width, height, near, far]);
    var matrix = new Float32Array(16);
    for(var i=0; i<matrix.length; i++){
        matrix[i] = getValue(buf+4*i, "float");
    }
    Module._free(buf);
    return matrix;
}
Module['getProjectionMatrix'] = getProjectionMatrix;

//Set marker configuration
var markerConfigFileNumber = 1;
function setMarkerConfig(file) {
    var reader = new FileReader;
    reader.readAsArrayBuffer(file);
    reader.onload = function() {
        var fileName = 'markerConfigration' + markerConfigFileNumber;
        var node = FS.createDataFile('/', fileName, new Uint8Array(reader.result), true, true);
        markerConfigFileNumber++;
        Module.ccall('setMarkerConfig', 'number', ['string'], [fileName]);
    }
}
Module['setMarkerConfig'] = setMarkerConfig;

//Detect tags on image and return JSON onject including pair of tag ID and its 2D position
function findTagsOnImage (canvas, drawLine) {
    var ctx = canvas.getContext('2d');
    var inputBuf = Module._malloc(canvas.width*canvas.height);
    var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var binary = new Uint8Array(img.data.length/4);
    for(var i=0; i<binary.length; i++){
        setValue(inputBuf+i, Math.min(0.299 * img.data[4*i] + 0.587 * img.data[4*i+1] + 0.114 * img.data[4*i+2], 255), "i8");
    }
    var output = Module.ccall('findTagsOnImage', 'string', ['number', 'number', 'number'], [inputBuf, canvas.width, canvas.height]);
    var obj = JSON.parse(output);

    if(drawLine){
        //Draw lines
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgb(255, 0, 192)';
        for(tag in obj){
            ctx.beginPath();
            ctx.moveTo(obj[tag][0][0], obj[tag][0][1]);
            ctx.lineTo(obj[tag][1][0], obj[tag][1][1]); 
            ctx.lineTo(obj[tag][2][0], obj[tag][2][1]); 
            ctx.lineTo(obj[tag][3][0], obj[tag][3][1]);
            ctx.closePath();
            ctx.stroke(); 
        }
    }
    Module._free(inputBuf);
    return obj
}
Module['findTagsOnImage'] = findTagsOnImage;

//Detect tags and return JSON object including pairs of tag name and its transformation matrix
function get3dPose (canvas, rectification) {
    var ctx = canvas.getContext('2d');
    var inputBuf = Module._malloc(canvas.width*canvas.height);
    var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var binary = new Uint8Array(img.data.length/4);
    for(var i=0; i<binary.length; i++){
        setValue(inputBuf+i, Math.min(0.299 * img.data[4*i] + 0.587 * img.data[4*i+1] + 0.114 * img.data[4*i+2], 255), "i8");
    }
    var output = Module.ccall('get3dPosition', 'string', ['number', 'number', 'number', 'number'], [inputBuf, canvas.width, canvas.height, rectification]);
    var obj = JSON.parse(output);

    if(rectification){
        var outputImage = ctx.createImageData(canvas.width, canvas.height);
        for(var i=0; i<canvas.width*canvas.height; i++){
            var val = getValue(inputBuf+i, "i8");
            if(val<0) val += 255;
            outputImage.data[4*i] = val;
            outputImage.data[4*i+1] = val;
            outputImage.data[4*i+2] = val;
            outputImage.data[4*i+3] = 255;
        }
        ctx.putImageData(outputImage, 0, 0);
    }
    Module._free(inputBuf);
    return obj
}
Module['get3dPose'] = get3dPose;
this['Chilitags'] = Module;
