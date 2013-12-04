/*   Copyright 2013 EPFL                                                        *
 *                                                                              *
 *   This file is part of chilitags.                                            *
 *                                                                              *
 *   Chilitags is free software: you can redistribute it and/or modify          *
 *   it under the terms of the Lesser GNU General Public License as             *
 *   published by the Free Software Foundation, either version 3 of the         *
 *   License, or (at your option) any later version.                            *
 *                                                                              *
 *   Chilitags is distributed in the hope that it will be useful,               *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of             *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the              *
 *   GNU Lesser General Public License for more details.                        *
 *                                                                              *
 *   You should have received a copy of the GNU Lesser General Public License   *
 *   along with Chilitags.  If not, see <http://www.gnu.org/licenses/>.         *
 *******************************************************************************/

#include <iostream>
#include <sstream>
#include <map>
#include <string>
#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>

#include <chilitags/Chilitag.hpp>
#include <chilitags/DetectChilitags.hpp>
#include <chilitags/Quad.hpp>
#include <chilitags/Objects.hpp>

const static cv::Scalar scColor(255, 0, 255);
const static cv::Mat cameraMatrix = (cv::Mat_<double>(3,3) << 5.2042395975892214e+02, 0., 3.2259445099873381e+02, 0., 4.8554104316510291e+02, 2.3588522427939671e+02, 0., 0., 1.);
const static cv::Mat distCoeffs = (cv::Mat_<double>(5, 1) << -1.6021517508242436e-01, 6.1537421631596201e-01, -2.2085672036127502e-03, 2.6041952525647509e-03, -7.2585518912880542e-01);
cv::Mat inputImage;
chilitags::DetectChilitags detect(&inputImage);
chilitags::Objects objects(cameraMatrix, distCoeffs, 27);

extern "C" {
    //Detect the tags and return the number of tags
    int detectTag(uchar* input, int width, int height, int* tagList)
    {
        inputImage = cv::Mat(height, width, CV_8U, input);
        detect.update();
        int num = 0;
        for(int tagId=0; tagId<1024; ++tagId){
            chilitags::Chilitag tag(tagId);
            if(tag.isPresent()){
                *tagList = tagId;
                tagList++;
                num++;
                chilitags::Quad tCorners = tag.getCorners();
                // We start by drawing this quadrilateral
                for (size_t i = 0; i < chilitags::Quad::scNPoints; ++i) {
                    cv::line(
                        inputImage,
                        tCorners[i],
                        tCorners[(i+1)%4],
                        scColor, 4);
                }
            }
        }
        return num;
    }

    //Return 3D positions of tags
    int get3dPosition(uchar* input, int width, int height, char* output)
    {
        inputImage = cv::Mat(height, width, CV_8U, input);
        detect.update();
        int num = 0;
        std::ostringstream str;
        str << "[ ";
        for(auto& kv : objects.all()){
            //std::cout << kv.first << ": " << cv::Mat(kv.second) << std::endl;
            str << "{\"name\":\"" << kv.first << "\",";
            str << "\"matrix\":" << cv::Mat(kv.second).reshape(1,1) << "},";
            num++;
        }
        std::string ret = str.str();
        ret[ret.size()-1] = ']';
        strcpy(output, ret.c_str());
        return num;
    }
}
