# Abstract learning in vision

# Description

This work tries to open a new window for image processing by focusing on a more abstract concept than a pixel, and this concept is a shape ([Bézier curves](https://en.wikipedia.org/wiki/B%C3%A9zier_curve) on [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics) file).

Over the years, most image processing works focus on pixels as the smallest building blocks and build extraordinary abilities over this concept (classification, segmentation…).

Although the outstanding achievements, this attitude has many flaws, that some of them, I believe we can overcome them by using a more abstract concept like shapes.

## Indifferent to resolution

When you work with pixels, you are always bound to the image&#39;s resolution, and by changing the resolution dramatically, you can affect the ability to learn or infer.

By using shapes, we can learn without caring about the resolution.

## Immunity to adversarial attacks

Adversarial attacks on image processing usually caused by small perturbations that accumulated over the pixels. Those attacks should be more sophisticated to accumulated over shapes because of 2 significant aspects:

- Shape encapsulates the data denser than pixels.
- We can split the image into shapes and analyze them separately.

## Generalized learning

I believe that all the information of images is concentrated on the object&#39;s edges inside the image. Suppose we could extract them carefully, not an easy task but more straightforward than nowadays image processing tasks. In that case, we could increase our learning abilities by starting our learning from a higher standpoint (&quot;Standing on the shoulders of giants&quot;).

# Flow

To prove the ability to learn from shapes

## Choose dataset

I choose the [DAVIS 2016 challenge](https://davischallenge.org/) dataset. Although it is a video challenge, the [dataset](https://graphics.ethz.ch/Downloads/Data/Davis/DAVIS-data.zip) contains annotated images from several classes that were easy to convert to shapes. I took only the annotated object from this dataset and the relevant category from this image. I tried to focus on proving the ability to learn from shapes, so I choose the most straightforward dataset to extract contours.

## Extract the shapes

I followed those steps to extract the shapes from the images:

- I use [cv2 findContours](https://docs.opencv.org/4.5.2/d3/dc0/group __imgproc__ shape.html#gadf1ad6a0b82947fa1fe3c3d497f260e0) with [CHAIN\_APPROX\_TC89\_L1](https://docs.opencv.org/3.4/d3/dc0/group __imgproc__ shape.html#ga4303f45752694956374734a03c54d5ff) algorithm to create a simple line over the objects (Python code)
- I use path-simplification from [paperjs](http://paperjs.org/examples/path-simplification/) to create [Bézier curves](https://en.wikipedia.org/wiki/B%C3%A9zier_curve) from the contours and reduce the complexity of the lines and then save them as [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics) files (JS code).

## Represent the shapes

Now when I have an SVG file that contains a list of Bézier curves that all curves contain:

Start location (x,y), Control 1(x,y), Control 2 (x,y), End location (x,y).

I followed those steps to create an input to my model:

- Scale both axes to max 99.
- Round the values to become integer values
- Combine (x,y) by this formula: .
- Return 4 integers between 0 and 9999 to represent each curve.

## Building the model

I build the model based on the [Vision Transformer (ViT)](https://keras.io/examples/vision/image_classification_with_vision_transformer/) model. The significant differences are:

- In ViT&#39;s model, they use patches, but I use my representation for Bézier curves.
- In ViT&#39;s model, they encode each patch with a dense layer. I use embedding for each of the four integers of the curve and concatenate the embedding to one vector.

After those changes, we have the exact vector sizes, and the rest of the models are the same.

## Train on unsupervised task

I create an unsupervised task for those reasons:

- I have a small amount of data, and I want to avoid overfitting
- To make the network &quot;understand&quot; the Bézier curves in general, unrelated to the classification task.

The task was to draw a random line in addition to the original SVG file and classify if the new line intersects the object (any of the curves) in the SVG file or not.

I use [svgpathtools](https://github.com/mathandy/svgpathtools) to determine if there is an intersection.

## Train on a classification task

I took the model from the unsupervised task and replaced the two last dense layers with two new dense layers with the output size of the number of classes in the DAVIS dataset.

I train this updated model.

# Results

I compare my results with those models over the same dataset:

- ResNet50 – fine-tune (classic classification) 99%
- Vision Transformer (ViT) train from scratch 80%
- My model 65%

Although my result does not beat the state-of-the-art methods, it is just the first try, and I proved that this is a valid method, and I believe I will overcome the state-of-the-art techniques soon.

# Supplementary data

- Github
  - All the code
- Google drive
  - Davis dataset after preprocessing
  - The unsupervised model trained checkpoint
- Google Collab
  - All the notebooks
- tensorboard.dev
  - All metrics
