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

#include <Chilitag.hpp>
#include <DetectChilitags.hpp>

extern "C" {
	void createTag(uchar* ret)
	{
		cv::Mat inputImage(480, 640, CV_8U, ret);
		chilitags::DetectChilitags detect(&inputImage);
		detect.update();
		std::cout << "Update!" << std::endl;
		for(int tagId=0; tagId<1024; ++tagId){
			chilitags::Chilitag tag(tagId);
			if(tag.isPresent()){
				std::cout << tagId << std::endl;
			}
		}
	}

	void imageData(uchar* input, uchar* output) {
		
		cv::Mat image(480, 640, CV_8U, input);
	    	cv::Point2i p1(120, 20);
		cv::Point2i p2(120, 190);
    		cv::line(image, p1, p2, cv::Scalar(255,0,255), 1);
		output = image.clone().data;
		std::cout << input[0] << ", " << output[0] << std::endl;
	}

}
