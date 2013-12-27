#  Chilitags.js
Chilitags.js is a direct port of Chilitags ([https://github.com/chili-epfl/chilitags](https://github.com/chili-epfl/chilitags)) to JavaScript, using Emscripten.

Chilitags.js was developed internally for projects of the [CHILI lab](http://chili.epfl.ch/) (Computer-Human Interaction in Learning and Instruction, formerly CRAFT).

##  Content
This repository of Chilitags.js consists of two components:
* the library itself.
* `src/`, source codes to make chilitags.js.
    * `src/jschilitags.cpp`: C wrapper of Chilitags C++ codes.
    * `src/chilitags-javascript.js`: JavaScript snippet of end-user API.
* `samples/`, the sample programs illustrating how to use the library.

##  How to build
### Install Emscripten
Refer to [Emscripten install documentation](https://github.com/kripken/emscripten/wiki/Emscripten-SDK)

We assume hereafter that `emscripten` is installed in `$EMSCRIPTEN_ROOT` (and
that `$EMSCRIPTEN_ROOT` is in your path, ie, you can call `emcc` and `em++`
from anywhere).

**NOTE**: Use Emscripten 1.5.9 until [issue 1886](https://github.com/kripken/emscripten/pull/1886) will be solved.
```
$ cd $EMSCRIPTEN_ROOT
$ git checkout -b 1.5.9 1.5.9
```

### Build OpenCV
* Build OpenCV with emscripten
```
$ cd build
$ emconfigure cmake -DCMAKE_CXX_FLAGS="-O2 -DNDEBUG" -DCMAKE_INSTALL_PREFIX=$EMSCRIPTEN_ROOT/system ..
```

* We recommend you to **turn off** all flags except `BUILD_SHARED_LIBS`, `BUILD_opencv_calib3d`, `BUILD_opencv_core`, `BUILD_opencv_features2d`, `BUILD_opencv_flann`, `BUILD_opencv_imgproc`, and `ENABLE_OMIT_FRAME_POINTER`.

Then:
```
$ make install
```

As a result, OpenCV is compiled by `clang` to libraries which includes LLVM
bytecode only.  These libraries are installed to `$EMSCRIPTEN_ROOT/system/` to
make it easy for other emscripten project to link with.

**NOTE**: Use OpenCV 2.4.8 or later, or build [soure code on
github](https://github.com/Itseez/opencv) until 2.4.8 will be released.

### Build chilitags.js

First install and compile `chilitags`:

```
$ git clone https://github.com/chili-epfl/chilitags.git
$ cd chilitags
$ mkdir build-emcc && cd build-emcc
$ emconfigure cmake -DCMAKE_CXX_FLAGS="-O2 -DNDEBUG" -DCMAKE_INSTALL_PREFIX=$EMSCRIPTEN_ROOT/system -DOpenCV_DIR=$EMSCRIPTEN_ROOT/system/share/OpenCV -DWITH_CREATOR=OFF -DWITH_DETECTOR=OFF ..
$ make install
```

Then:
```
$ git clone https://github.com/chili-epfl/chilitags.js.git
$ cd chilitags.js
$ mkdir build-emcc && cd build-emcc
$ em++ -std=c++11 -O2 -s OUTLINING_LIMIT=40000 ../src/jschilitags.cpp -lchilitags -lopencv_core -lopencv_imgproc -lopencv_calib3d -o chilitags.js -s EXPORTED_FUNCTIONS="['_setCameraConfiguration', '_getProjectionMatrix', '_setMarkerConfig', '_findTagsOnImage', '_get3dPosition']" --post-js ../src/chilitags-javascript.js
```
##  API documentation

### 2D detection
#### Chilitags.findTagsOnImage(canvas, drawLine)
* canvas: `object` (`<canvas>` element)
* drawLine: `bool`

Returns the object that includes pairs of tag ID and array of positions of its corners.

example:
```JavaScript
var canvas = document.getElementById('image');
var tags = Chilitags.findTagsOnImage(canvas, true);

//tags -> {"tag ID": [[x0, y0],[x1, y1],[x2, y2],[x3, y3]], ...}
for (var tagId in tags){
    console.log('corner[0] of 'tagID + ' (x:' + tags[tagID][0][0] + ', y:' + tags[tagId][0][1] + ')');
}
```

demo: [https://chili-research.epfl.ch/chilitags.js/samples/detection-2d/](https://chili-research.epfl.ch/chilitags.js/samples/detection-2d/)
### 3D detection
#### Chilitags.get3dPose(canvas, rectification)
* canvas: `object` (`<canvas>` element)
* rectification: `bool`

Returns the object that includes pairs of tag name and its transformation matrix.

example:
```JavaScript
var canvas = document.getElementById('image');
var tags = Chilitags.get3dPose(canvas, true);

//tags -> {"tag ID": [m11, m12, m13, m14, m21, ... m44], ...}
for (var tagId in tags){
    var str = 'transformation of 'tagID + ':[';
    for(var i=0; i< tags[tagId].length(); i++){
        str += tags[tagID][i] + ', ';
    }
    str += ']';
    console.log(str);
}
```
demo:[https://chili-research.epfl.ch/chilitags.js/samples/detection-3d/](https://chili-research.epfl.ch/chilitags.js/samples/detection-3d/)

#### Chilitags.getProjectionMatrix(width, height, near, far)
* width: `float`
* height: `float`
* near: `float`
* far: `float`

Returns `Float32Array` (16 elements) of projection matrix of camera.

example:
```JavaScript
var projectionMatrix = Chilitags.getProjectionMatrix(960, 640, 1, 100);
```

### Camera calibration
#### Chilitags.setNewCamera(file)
* file: XML/YAML file in OpenCV format(See [Camera calibration With OpenCV](http://docs.opencv.org/doc/tutorials/calib3d/camera_calibration/camera_calibration.html))

Set intrinsic parameters and distortion coefficients of camera.

example:
```JavaScript
var file = document.getElementById('calibrationFile');
file.addEventListener('change', function(e) {
    Chilitags.setNewCamera(e.target.files[0]);
}, false);
```

### Marker configuration
#### Chilitags.setMarkerConfig(file)
* file: YAML file (e.g. [chilitags/share/markers_configuration_sample.yml](https://github.com/chili-epfl/chilitags/blob/master/share/markers_configuration_sample.yml))

Set marker configuration.

example:
```JavaScript
var file = document.getElementById('markerConfigFile');
file.addEventListener('change', function(e) {
    Chilitags.setMarkerConfig(e.target.files[0]);
}, false);
```


