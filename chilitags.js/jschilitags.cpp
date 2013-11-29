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
#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>

#include <chilitags/Chilitag.hpp>
#include <chilitags/DetectChilitags.hpp>
#include <chilitags/Quad.hpp>

const static cv::Scalar scColor(255, 0, 255);
cv::Mat inputImage;
chilitags::DetectChilitags detect(&inputImage);

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
    int get3dPosition(uchar* input, int width, int height, float* output)
    {
        inputImage = cv::Mat(height, width, CV_8U, input);
        detect.update();
        int num = 0;
        for(int tagId=0; tagId<1024; ++tagId){
            chilitags::Chilitag tag(tagId);
            if(tag.isPresent()){
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
                *output = tCorners[0];
                output++;
            }
        }
        return num;

    }
}
