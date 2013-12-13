function setNewCamera(file) {
    var reader = new FileReader;
    reader.readAsText(file);
    reader.onload = function() {
        var dpObj = new DOMParser();
        var xmlObj = dpObj.parseFromString(reader.result, "text/xml");
        var converter = new X2JS();
        var jsonObj = converter.xml2json(xmlObj);
        var cameraMatrixString = jsonObj.opencv_storage.camera_matrix.data;
        cameraMatrixString = cameraMatrixString.replace(/\.\s+|\.$/g, ".0 ").replace(/^\s+|\n+|\s+$/g, "").replace(/\s+/g, ",");
        var camMatArray = JSON.parse('[' + cameraMatrixString + ']');
        var distCoeffsString = jsonObj.opencv_storage.distortion_coefficients.data;
        distCoeffsString = distCoeffsString.replace(/\.\s+|\.$/g, ".0 ").replace(/^\s+|\n+|\s+$/g, "").replace(/\s+/g, ",");
        var distCoeffsArray = JSON.parse('[' + distCoeffsString + ']');
        var cameraMatrix = Module._malloc(9*8);
        var distCoeffs = Module._malloc(5*8);
        for(var i=0; i<camMatArray.length; i++){
            setValue(cameraMatrix+i*8, camMatArray[i], "double");
        }
        for(var i=0; i<distCoeffsArray.length; i++){
            setValue(distCoeffs+i*8, distCoeffsArray[i], "double");
        }
        Module.ccall('setCameraConfiguration', 'number', ['number', 'number'], [cameraMatrix, distCoeffs]);
        Module._free(cameraMatrix);
        Module._free(distCoeffs);
    }
}
Module['setNewCamera'] = setNewCamera;

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

function detect (canvas, rectification) {
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
Module['detect'] = detect;
this['Chilitags'] = Module;
