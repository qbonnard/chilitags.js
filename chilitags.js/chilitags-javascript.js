function detect (canvas) {
    var inputBuf = Module._malloc(canvas.width*canvas.height);
    var img = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    var binary = new Uint8Array(img.data.length/4);
    for(var i=0; i<binary.length; i++){
        setValue(inputBuf+i, Math.min(0.299 * img.data[4*i] + 0.587 * img.data[4*i+1] + 0.114 * img.data[4*i+2], 255), "i8");
    }
    var output = Module.ccall('get3dPosition', 'string', ['number', 'number', 'number'], [inputBuf, width, height]);
    var obj = JSON.parse(output);
    Module._free(inputBuf);
    return obj
}
Module['detect'] = detect;
this['Chilitags'] = Module;
