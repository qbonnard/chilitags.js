function setNewCamera(file) {
    //Module['cameraConfiguration'] = file;
    //FS.mkdir('/data');
    //FS.mount(MEMFS, {}, '/data');
    //FS.syncfs(true, function(err) {
    //    var ret = FS.findObject("/data");
    //});
    //Module.ccall('setCameraConfiguration', 'number', [], []);
    //var ret = FS.findObject("/data");
    //console.log("aaa");
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

function detect (canvas, isDistorted) {
    var inputBuf = Module._malloc(canvas.width*canvas.height);
    var img = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    var binary = new Uint8Array(img.data.length/4);
    for(var i=0; i<binary.length; i++){
        setValue(inputBuf+i, Math.min(0.299 * img.data[4*i] + 0.587 * img.data[4*i+1] + 0.114 * img.data[4*i+2], 255), "i8");
    }
    var output = Module.ccall('get3dPosition', 'string', ['number', 'number', 'number', 'number'], [inputBuf, canvas.width, canvas.height, isDistorted]);
    var obj = JSON.parse(output);
    var outputImage = canvas.getContext('2d').createImageData(canvas.width, canvas.height);
    for(var i=0; i<canvas.width*canvas.height; i++){
        var val = getValue(inputBuf+i, "i8");
        if(val<0) val += 255;
        outputImage.data[4*i] = val;
        outputImage.data[4*i+1] = val;
        outputImage.data[4*i+2] = val;
        outputImage.data[4*i+3] = 255;
    }
    canvas.getContext('2d').putImageData(outputImage, 0, 0);
    Module._free(inputBuf);
    return obj
}
Module['detect'] = detect;
this['Chilitags'] = Module;
