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
