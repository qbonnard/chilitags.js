chilitags.js: build/chilitags.js src/chilitags-javascript.js
	cat $^ > $@

build/chilitags.js: build src/jschilitags.cpp
	em++ -std=c++11 -O2 -s OUTLINING_LIMIT=40000 src/jschilitags.cpp -lchilitags -lopencv_core -lopencv_imgproc -lopencv_calib3d -lhighgui -o $@ -s EXPORTED_FUNCTIONS="['_setFilter', '_find', '_set3DFilter', '_set2DFilter', '_estimate', '_readTagConfiguration', '_setDefaultTagSize', '_readCalibration', '_getCameraMatrix', '_getDistortionCoeffs']"

build:
	mkdir build