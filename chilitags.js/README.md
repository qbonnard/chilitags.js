#  chilitags.js
##  How to build
### Install Emscripten
See [Download Emscripten](https://github.com/kripken/emscripten/wiki/Emscripten-SDK)

We assume hereafter that `emscripten` is install in `$EMSCRIPTEN_ROOT` (and
that `$EMSCRIPTEN_ROOT` is in your path, ie, you can call `emcc` and `em++`
from anywhere).

### Build OpenCV
* Build OpenCV with emscripten
```
$ cd build
$ emconfigure cmake -DCMAKE_INSTALL_PREFIX=$EMSCRIPTEN_ROOT/system ..
```

* Set `CMAKE_BUILD_TYPE=None`, `CMAKE_CXX_FLAGS="-O2 -DNDEBUG"`
* Set `CMAKE_INSTALL_PREFIX=EMSCRIPTEN_ROOT/system`
* It is recommended that all flags except `BUILD_SHARED_LIBS`, `BUILD_opencv_calib3d`, `BUILD_opencv_core`, `BUILD_opencv_features2d`, `BUILD_opencv_flann`, `BUILD_opencv_highgui`, `BUILD_opencv_imgproc`, `BUILD_opencv_ts`, `ENABLE_OMIT_FRAME_POINTER` are set to OFF.

Then:
```
$ make -j4 && make install
```
### Build chilitags.js

First install and compile `chilitags`:

```
$ git clone https://github.com/chili-epfl/chilitags.git
$ cd chilitags
$ mkdir build-emcc && cd build-emcc
$ emconfigure cmake -DCMAKE_INSTALL_PREFIX=$EMSCRIPTEN_ROOT/system ..
$ make -j4 && make install
```

Then:
```
$ git clone https://github.com/chili-epfl/AR.js.git
$ cd AR.js/chilitags.js
$ mkdir build-emcc && cd build-emcc
$ em++ -std=c++11 -O2 -s OUTLINING_LIMIT=40000 ../jschilitags.cpp -lchilitags -lopencv_core -lopencv_imgproc -lopencv_calib3d -o chilitags.js -s EXPORTED_FUNCTIONS="['_detectTag', '_get3dPosition']" --post-js ../chilitags-javascript.js
```

