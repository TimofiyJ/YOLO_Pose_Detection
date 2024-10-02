/**
 * Render prediction boxes
 * @param {HTMLCanvasElement} canvasRef canvas tag reference
 * @param {Array} boxes_data boxes array
 * @param {Array} scores_data scores array
 * @param {Array} classes_data class array
 * @param {Array[Number]} ratios boxes ratio [xRatio, yRatio]
 */

const colors = {
  nose: 'red',
  leftEye: 'blue',
  rightEye: 'green',
  leftEar: 'orange',
  rightEar: 'purple',
  leftShoulder: 'yellow',
  rightShoulder: 'pink',
  leftElbow: 'cyan',
  rightElbow: 'magenta',
  leftWrist: 'lime',
  rightWrist: 'indigo',
  leftHip: 'teal',
  rightHip: 'violet',
  leftKnee: 'gold',
  rightKnee: 'silver',
  leftAnkle: 'brown',
  rightAnkle: 'black'
};

const connections = [
  ['nose', 'leftEye'],
  ['nose', 'rightEye'],
  ['leftEye', 'leftEar'],
  ['rightEye', 'rightEar'],
  ['leftShoulder', 'rightShoulder'],
  ['leftShoulder', 'leftElbow'],
  ['rightShoulder', 'rightElbow'],
  ['leftElbow', 'leftWrist'],
  ['rightElbow', 'rightWrist'],
  ['leftShoulder', 'leftHip'],
  ['rightShoulder', 'rightHip'],
  ['leftHip', 'rightHip'],
  ['leftHip', 'leftKnee'],
  ['rightHip', 'rightKnee'],
  ['leftKnee', 'leftAnkle'],
  ['rightKnee', 'rightAnkle']
];

export const renderBoxes = (canvasRef, landmarks_data, boxes_data, scores_data, xi, yi) => {
  const ctx = canvasRef.getContext("2d");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas

  for (let i = 0; i < scores_data.length; ++i) {
    const score = (scores_data[i] * 100).toFixed(1);
    let [y1, x1, y2, x2] = boxes_data.slice(i * 4, (i + 1) * 4);
    
    // Scale the bounding box coordinates
    x1 *= xi;
    x2 *= xi;
    y1 *= yi;
    y2 *= yi;
    const width = x2 - x1;
    const height = y2 - y1;

    // Draw bounding box
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x1, y1, width, height);

    // Get keypoints for this pose
    let keypoints = landmarks_data.slice([i, 0, 0], [1, -1, -1]).reshape([17, 3]).arraySync();
    const conf_threshold = 0.6;

    // Draw keypoints
    for (let j = 0; j < keypoints.length; j++) {
      const x = keypoints[j][0] * xi;
      const y = keypoints[j][1] * yi;
      const bodyPart = Object.keys(colors)[j];

      // Only draw keypoints above the confidence threshold
      if (keypoints[j][2] >= conf_threshold) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = colors[bodyPart];
        ctx.fill();
        ctx.closePath();
      }
    }

    // Draw connections between keypoints
    for (const [partA, partB] of connections) {
      const idxA = Object.keys(colors).indexOf(partA);
      const idxB = Object.keys(colors).indexOf(partB);
      const x1 = keypoints[idxA][0] * xi;
      const y1 = keypoints[idxA][1] * yi;
      const x2 = keypoints[idxB][0] * xi;
      const y2 = keypoints[idxB][1] * yi;

      // Only draw lines if both keypoints are above the confidence threshold
      if (keypoints[idxA][2] >= conf_threshold && keypoints[idxB][2] >= conf_threshold) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
};


