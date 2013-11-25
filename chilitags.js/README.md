#  chilitags.js
##  How to build
### Install Emscripten
See [Download Emscripten](https://github.com/kripken/emscripten/wiki/Emscripten-SDK)
### Build OpenCV
* Build OpenCV with emscripten
```
cd build
emconfigure cmake ..
make -j4 
```

* Set `CMAKE_BUILD_TYPE=None`, `CMAKE_CXX_FLAGS="-O2 -DNDEBUG"`
* Set `CMAKE_INSTALL_PREFIX=EMSCRIPTEN_ROOT/system`
* It is recommended that all flags except `BUILD_SHARED_LIBS`, `BUILD_opencv_calib3d`, `BUILD_opencv_core`, `BUILD_opencv_features2d`, `BUILD_opencv_flann`, `BUILD_opencv_highgui`, `BUILD_opencv_imgproc`, `BUILD_opencv_ts`, `ENABLE_OMIT_FRAME_POINTER` are set to OFF.


* Install to `EMSCRIPTEN_ROOT/system`

### Build chilitags.js

```
cd ~
git clone https://github.com/chili-epfl/AR.js.git
cd AR.js/chilitags.js/chilitags
mkdir build-emcc && cd build-emcc
emconfigure cmake ..
make -j4

cd ../..
em++ jschilitags.cpp chilitags/build-emcc/src/lib/libchilitags.so EMSCRIPTEN_ROOT/system/lib/libopencv_*.so -Ichilitags/src/lib/include/ -O2 -o chilitags.js -s EXPORTED_FUNCTIONS="['_detectAllTags', '_detectTag', '_imageData']"
```
