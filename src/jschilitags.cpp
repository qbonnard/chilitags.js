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
#include <fstream>
#include <map>
#include <string>
#include <opencv2/core/core.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>

#include <chilitags/Chilitag.hpp>
#include <chilitags/DetectChilitags.hpp>
#include <chilitags/Quad.hpp>
#include <chilitags/Objects.hpp>

const static cv::Scalar scColor(255, 0, 255);
cv::Mat cameraMatrix = (cv::Mat_<double>(3, 3) << 5.2042395975892214e+02, 0., 3.2259445099873381e+02, 0., 4.8554104316510291e+02, 2.3588522427939671e+02, 0., 0., 1.);
cv::Mat distCoeffs = (cv::Mat_<double>(5, 1) << -1.6021517508242436e-01, 6.1537421631596201e-01, -2.2085672036127502e-03, 2.6041952525647509e-03, -7.2585518912880542e-01);
cv::Mat inputImage;
chilitags::DetectChilitags detect(&inputImage);
chilitags::Objects objects(cameraMatrix, distCoeffs, 27, 1);

extern "C" {
    //Set new camera configuration
    void setCameraConfiguration(const char* filename)
    {
        cv::Mat newCameraMatrix, newDistCoeffs;
        cv::FileStorage fs(filename, cv::FileStorage::READ);
        fs["camera_matrix"] >> newCameraMatrix;
        fs["distortion_coefficients"] >> newDistCoeffs;

        cameraMatrix = newCameraMatrix.clone();
        distCoeffs = newDistCoeffs.clone();
        objects.resetCalibration(cameraMatrix, distCoeffs);
    }
    
    //Return projrction matrix
    float* getProjectionMatrix(float width, float height, float near, float far)
    {
        float* projection = (float*)malloc(sizeof(float)*16);
        projection[0] = 2 * (float)cameraMatrix.at<double>(0, 0) / width;
        projection[1] = 0;
        projection[2] = 2 * (float)cameraMatrix.at<double>(0, 2) / width - 1;
        projection[3] = 0;
        projection[4] = 0;
        projection[5] = -2 * (float)cameraMatrix.at<double>(1, 1) / height;
        projection[6] = -2 * (float)cameraMatrix.at<double>(1, 2) / height + 1;
        projection[7] = 0;
        projection[8] = 0;
        projection[9] = 0;
        projection[10] = (far + near) / (far - near);
        projection[11] = -2 * far * near / (far - near);
        projection[12] = 0;
        projection[13] = 0;
        projection[14] = 1;
        projection[15] = 0;
        return projection;
    }

    //Set Marker config file
    //TODO:It sometimes doesn't work properly (very unstable).
    void setMarkerConfig(const char* filename)
    {
        std::string filenameString(filename);
        objects = chilitags::Objects(cameraMatrix, distCoeffs, filenameString, 0, 1.0);
    }

    //Detect the tags on image and return the pair of tag ID and its 2D position.
    char* findTagsOnImage(uchar* input, int width, int height)
    {
        inputImage = cv::Mat(height, width, CV_8U, input);
        detect.update();
        int num = 0;
        std::ostringstream str;
        str.setf(std::ios::fixed, std::ios::floatfield);
        str.precision(4);
        str << "{ ";
        for(int tagId=0; tagId<1024; ++tagId){
            chilitags::Chilitag tag(tagId, 4);
            if(tag.isPresent()){
                chilitags::Quad tCorners = tag.getCorners();
                str << "\"" << tagId << "\":[" << tCorners[0] << "," << tCorners[1] << "," << tCorners[2] << "," << tCorners[3] << "],";
            }
        }
        std::string ret = str.str();
        ret[ret.size()-1] = '}';
        char* output = (char*)malloc(sizeof(char) * (ret.length()+1));
        strcpy(output, ret.c_str());
        return output;
    }

    //Detect tags and return pairs of tag IDs and its transformation matrix
    char* get3dPosition(uchar* input, int width, int height, bool rectification)
    {
        inputImage = cv::Mat(height, width, CV_8U, input);
        detect.update();
        int num = 0;
        std::ostringstream str;
        str.setf(std::ios::fixed, std::ios::floatfield);
        str.precision(4);
        str << "{ ";
        for(auto& kv : objects.all()){
            str << "\"" << kv.first << "\":[";
            for(int i=0; i<4; i++){
                for(int j=0; j<4; j++){
                    str << kv.second(i, j);
                    if(i != 3 || j != 3) str << ",";
                }
            }
            str << "],";
            num++;
        }
        std::string ret = str.str();
        ret[ret.size()-1] = '}';
        char* output = (char*)malloc(sizeof(char) * (ret.length()+1));
        strcpy(output, ret.c_str());

        //undistortion of image
        if(rectification){
            cv::Mat originalImage = inputImage.clone();
            undistort(originalImage, inputImage, cameraMatrix, distCoeffs);
        }
        return output;
    }
}
