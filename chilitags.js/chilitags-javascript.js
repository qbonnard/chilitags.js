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
        console.log(xmlObj);
        var converter = new X2JS();
        var jsonObj = converter.xml2json(xmlObj);
        console.log(jsonObj); 
        //var camMatArray = JSON.parse('[' + jsonObj.opencv_storage.camera_matrix.data + ']');
        console.log(jsonObj.opencv_storage.camera_matrix.data);
        //var cameraMatrix = Module._malloc(16*8);
        //var distCoeffs = Module._malloc(5*8);
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
