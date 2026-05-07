Variance: How spread out are the values in a dataset? 



Variance can be applied to any pixel-based data, not just brightness.

Variance (Image processing): In my grayscale image, i'm looking at brightness per pixel



Variance is not tied to brightness-it's tied to whatever data you feed it 



Variance is a tool, not a specific technique 



It can answer different questions depending on input:

brightness -> contrast / structure

gradients  -> edge strength

frame diff -> motion intensity 

regions    -> texture variation



variance = spread of numbers  

contrast = differences in brightness



Structure (edges, shapes, text) creates sharp brightness changes. 



Empty scene still had high variance

&#x09;shadows

&#x09;lighting gradients 

&#x09;edges of objects 

&#x09;camera noise   -> unintentional structure



Creating a multi stage filtering pipeline for live video frames



Spatial -> within a single frame (image)

&#x09;what are pixels doing right now? 



spatial captures (edges, contrast, texture, structure) 



Temporal -> how things change across frames over time

&#x09;previous frame vs current frame 

&#x09;motion

&#x09;camera shake 

&#x09;scene change



***\*swap variance for edge detection later***



After gate 1, you have:

a stable, information-rich frame

&#x09;now you can assume 

&#x09;no camera shake

&#x09;no motion blur 

&#x09;enough contrast/detail 



need to find the right threshold first 



Stage 2 -> make text more separable

people use multiple techniques, but be carful



"apply the minimum number of transformations needed to maximize text contrast" 



Stage 2 - image refinement

&#x09;typical operations here 

&#x09;edge enhancement - sharpen text boundaries 

&#x09;contrast boosting -> make darks darker, lights lighter 

&#x09;noise reduction 

&#x09;thresholding (binarization) -> converting grayscale to binary 

&#x09;region cropping (optional)  -> only send the region that likely contains text 

&#x09;



Stage 2 gate

light contrast boost + thresholding 





Evaluating my results?

The question? How do people now that there preprocessing is sufficient? 



How do people actually evaluate preprocessing 

They use feedback loops, not guesswork



Step 1 - define a baseline

&#x09;run tesseract on raw frames		

&#x09;note accuracy

&#x09;note common mistakes 

&#x09;note common confidence scores 



Step 2 - apply ONE preprocessing change 

&#x09;add thresholding 

&#x09;or adjust contrast 



Step 3 - compare output



Step 4 - iterate 

&#x20;only keep changes that improve results. 



Preprocessing is judges by downstream performance, not visual intuition. 

How professionals avoid blind guessing, through metrics 



OCR metrics:

&#x09;character error rate (CER)

&#x09;word error rate (WER) 

&#x09;confidence scores 



&#x09;***\* use of log comparison*** 



In my system. I'm using variance as a frame quality gate.

&#x09;too low -> likely uninformative -> reject 

&#x09;medium/high -> potentially useful -> pass to the next stage



\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_



Investigating log data (Stability) 



**Stability Gate**

&#x09;Has the scene stopped changing in a meaningful way? 



I'm noticing that i'm getting a lot of alternating values (true/false) for stability



Its normal to see this alternating of values even with a static setup

&#x09;slight brightness shifts

&#x09;pixel noise 

&#x09;auto white balance adjustments 

&#x09;slight motion blur from exposure time 



the diff will naturally fluctuate around a boundary 



measures: total pixel change between two frames 

this is: a single frame difference threshold gate



* can be upgraded later



\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_



Investigating log data (Variance) 





The gray array holds values (1 value per pixel) representing how bright each individual pixel is. That gray array is then passed into the getVariance function. Through a series of equations, this function outputs 1 value representing **how varied the data is**.





At this point in time any given value of variance has no meaning to me. I need to create a mapping from numbers -> visual states. 

This is called **empirical calibration.**



A. Low structure (flat scenes) 

&#x09;blank wall (230,232) very steady

&#x09;solid color screen | all blue cutting board (75,76,74)

&#x09;		     all green cutting board (56,55)

&#x09;		     All pink scale (112,112) 

&#x09;		     How does light affect this? 



&#x09;out of focus image





pixels = same brightness -> low spread -> low variance

Not useful



B. Normal Background (your environment)

&#x09;desk

&#x09;room 

&#x09;random objects | water bottle (2ks+) 

&#x09;	       | chair 900-1k

&#x09;	       | headphone on chair (1500) 

&#x09;	       | Me = 3ks -> 3600 -> 4000 -> 4600

&#x09;	       | Kitchen back drop -> 2900 - 3K



moderate variation -> medium variance 



baseline cluster



C. High Detail (what you actually want)

&#x09;text on paper     | DSS Sticky -> 800-900 950

&#x09;printed labels    | DSS Paper  -> 200-300

&#x09;sharp edges       | Black text blue background -> (1100 - 1200) 

&#x09;		  | Receipt -> 200 - 300 





strong contrast (dark text vs light background) 

wide brightness spread

higher variance



this is target signal





D. Motion /instability (temporal distortion) 

&#x09;waving hand | huge swings 900-7500+

&#x09;moving camera | 5000-6000 steady 



motion affects variance differently 

this is not a level of detail group

&#x09; a disruption of reliable measurement



Moving forward: What kind of scene would produce this level of brightness spread? 



**observe -> label -> group -> set threshold** 









What variance is really sensitive to 



variance responds to:

&#x09;A. Lighting gradients 

&#x09;	even smooth lighting changes create spread 

&#x09;B. Micro-texture

&#x09;	paint, fabric, surface imperfections 

&#x09;C. Sensor noise

&#x09;	Random pixel variation everywhere 

&#x09;D. Compression artifacts 

&#x09;	especially in live webcam feeds 





This mapping helps me to understand the real behavior of variance: not about motion, about the spatial complexity inside the frame. 





\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_





Camera frame 



Stage 1: Variance + Stability (gate) 



Stage 2: Thresholding (make text readable) 



Tesseract OCR 



Confidence + text output 



\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_



Spatial: compare pixels to pixels (same frame) 

Temporal: compare frame to frame (over time) 



