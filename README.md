# Abstract learning in image processing

## Description

This work tries to open a new window for image processing by focusing on a more abstract concept than the pixel, and this concept is the shape, a set of cubic [Bézier curves](https://en.wikipedia.org/wiki/B%C3%A9zier_curve) (like on an [SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics) file).

Over the years, most image processing works focused on pixels as the smallest building blocks and built extraordinary capabilities using this concept (classification, segmentation, etc.).

Despitethe outstanding achievements, this attitude has many flaws that some of them, I believe, can be overcome by using a more abstract concept like shapes.

### Indifferent to resolution

When you work with pixels, you are always bound to the image&#39;s resolution. Changing the resolution dramatically can affect your ability to learn or infer.

By using shapes, we can learn without caring about the resolution.

### Immunity to adversarial attacks

Adversarial attacks on image processing are usually caused by small perturbations that accumulateover all the pixels. Those attacks should be more sophisticated to accumulated over shapes because of two significant aspects:

- Shape encapsulates the data denser than pixels.
- We can split the shapes within the image and analyze them separately.

### Generalized learning

I believe that all the information of an image concentrates on the object&#39;s edges inside the image. Suppose we could extract the edges carefully, not an easy task but more straightforward than nowadays image processing tasks. In that case, we could increase our learning capabilities by starting our learning from a higher standpoint.

## Flow

To prove the ability to learn from an abstract concept like shapes, I trained a model that used [Bézier curves](https://en.wikipedia.org/wiki/B%C3%A9zier_curve) as input and classified the object it represents. Here are the steps:

### Choosing dataset

I chose the [DAVIS 2016 challenge](https://davischallenge.org/) dataset. Although it is a video challenge, the [dataset](https://graphics.ethz.ch/Downloads/Data/Davis/DAVIS-data.zip) also contains annotated objects in images from several classes like a bear, camel, black-swan,goat, boat, bus, etc. (about 50 classes evenly distributed). I use only the annotated images in the dataset, about 3200 png images with one masked object in each image. Most of the annotated objects (masked) were easy to convert to shapes. I chose this dataset because it is the most straightforward dataset to extract the contours.

### Extracting the shapes

I followed these steps to extract the shapes from the images:

- I used [cv2 findContours](https://docs.opencv.org/4.5.2/d3/dc0/group__imgproc__shape.html#gadf1ad6a0b82947fa1fe3c3d497f260e0) with [CHAIN\_APPROX\_TC89\_L1](https://docs.opencv.org/3.4/d3/dc0/group__imgproc__shape.html#ga4303f45752694956374734a03c54d5ff) algorithm to create simple straight lines over the objects ([Python code](https://github.com/YossiAsher/abstract-learning-in-image-processing/blob/main/pre_processing.ipynb))
- I used path-simplification from [paperjs](http://paperjs.org/examples/path-simplification/) to create [Bézier curves](https://en.wikipedia.org/wiki/B%C3%A9zier_curve) from the contours and reduced the complexity of the lines ([JS code](https://github.com/YossiAsher/abstract-learning-in-image-processing/tree/main/path-simplification)).

### Representing the shapes

Now I have SVG files that contain a set of Bézier curves, and each curve contains:

Start location (x, y), Control 1 (x, y), Control 2 (x, y), End location (x, y).

I followed these steps to create an input to my model:

- Scaled both axes to max 99.
- Rounded the values to become integer values
- Combined each by this formula: 100 * x + y.
- Returned four integers between 0 and 9999 to represent each curve.

### Building the model

I builtthe model based on the [Vision Transformer (ViT)](https://keras.io/examples/vision/image_classification_with_vision_transformer/) model. However, there are two main differences between them:

- ViT&#39;s model uses patches. I used my representation of Bézier curves.
- ViT&#39;s model encodes each patch with a dense layer. I calculated the embedding for each of the four integers separately and concatenated the values to one vector.

In this stage, we have the exact vector sizes. The remaining layers of both models are the same.

### Training unsupervised task

Learning from Bézier curves is a little bit complicated. One option to deal with this complication is to train part of the network with an unsupervised task. This task should help the network &quot;understand&quot; the Bézier curves world in general, unrelated to any specific task. The task that I chose was to draw a random line in addition to the original SVG file and classify if the new line intersects the object (any of the curves) in the SVG file or not.

I use [svgpathtools](https://github.com/mathandy/svgpathtools) to determine if there is an intersection between the line and the object.

In addition, I knew that the dataset is relatively small (~3200 images, ~50 classes), so I used the unsupervised task to prevent overfitting.

### Training supervised task

The task was to classify the images based on the object within them. In my case, each image is a set of Bézier curves. The task is an easy task in the &quot;pixel world,&quot; but in the &quot;shape world,&quot; it is not trivial yet (I believe it will be someday). I created a transfer learning from the unsupervised task model by replacing the two lastdense layers. The new dense layers output the size of the number of classes in the DAVIS dataset.

I trained this updated model as a classification task.

## Results

I compared my results with baseline models over the same dataset and task (the supervised). The accuracy results were (I trained the models without any hyperparameters optimization):

- ResNet50 fine-tune (based on [this](https://www.tensorflow.org/tutorials/images/transfer_learning)) **99%** ([notebook](https://github.com/YossiAsher/abstract-learning-in-image-processing/blob/main/png_resnet50.ipynb))
- Vision Transformer (ViT) train from scratch 90% ([notebook](https://github.com/YossiAsher/abstract-learning-in-image-processing/blob/main/png_attention.ipynb))
- Learning from a set of Bézier curves (my model) ~65% ([notebook](https://github.com/YossiAsher/abstract-learning-in-image-processing/blob/main/svg_attention.ipynb))

The significant result is that it is possible to learn based on a higher abstraction like shapes and not just pixels. Perhaps in the future, we can even extend it to more domains like digital signal processing. Although my result does not beat the state-of-the-art methods, it is just the first attempt, and I believe this method will soon overcome them.

## Supplementary data

- [Github](https://github.com/YossiAsher/abstract-learning-in-image-processing)
  - All the code
- [Google drive](https://drive.google.com/drive/folders/1ZsacrKz1ZspmKT2BeqZmVPfd1qBLGpLe?usp=sharing)
  - Davis dataset – raw
  - Davis dataset after processing – png &amp; svg
  - The unsupervised model weights – checkpoint
  - Notebooks – Google Colab
- tensorboard.dev
  - [png-resnet50](https://tensorboard.dev/experiment/BAQYiz1cQZu1AObMMJW9gw)
  - [png-attention](https://tensorboard.dev/experiment/gNuz3aKRTlWmQjcVzyhlaw)
  - [svg-attention](https://tensorboard.dev/experiment/ZwIA1zTzSDC7Jpn4SGSmRQ)
