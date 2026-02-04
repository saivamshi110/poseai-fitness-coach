import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

const LivePoseTracker = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera | null>(null);

  const [isTracking, setIsTracking] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [isSquatting, setIsSquatting] = useState(false);

  // Helper to fix mirror issue
  const mirrorX = (x: number, canvas: HTMLCanvasElement) =>
    (1 - x) * canvas.width;

  // Draw pose
  const drawSkeleton = (results: any) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!results.poseLandmarks) return;

    /* ---------------- SQUAT REP COUNTER ---------------- */
    const leftHip = results.poseLandmarks[23];
    const leftKnee = results.poseLandmarks[25];

    if (leftHip && leftKnee) {
      if (leftHip.y > leftKnee.y && !isSquatting) {
        setIsSquatting(true);
      }

      if (leftHip.y < leftKnee.y && isSquatting) {
        setIsSquatting(false);
        setRepCount((prev) => prev + 1);
      }
    }

    /* ---------------- SKELETON LINES ---------------- */
    const connections = [
      [11, 13], [13, 15], // left arm
      [12, 14], [14, 16], // right arm
      [11, 12], // shoulders
      [23, 24], // hips
      [11, 23], [12, 24], // torso
      [23, 25], [25, 27], // left leg
      [24, 26], [26, 28], // right leg
    ];

    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;

    connections.forEach(([a, b]) => {
      const p1 = results.poseLandmarks[a];
      const p2 = results.poseLandmarks[b];
      if (!p1 || !p2) return;

      ctx.beginPath();
      ctx.moveTo(mirrorX(p1.x, canvas), p1.y * canvas.height);
      ctx.lineTo(mirrorX(p2.x, canvas), p2.y * canvas.height);
      ctx.stroke();
    });

    /* ---------------- HEAD DOT (NOSE) ---------------- */
    const head = results.poseLandmarks[0];
    if (head) {
      ctx.beginPath();
      ctx.arc(
        mirrorX(head.x, canvas),
        head.y * canvas.height,
        12,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "red";
      ctx.fill();
    }
  };

  /* ---------------- MEDIAPIPE SETUP ---------------- */
  useEffect(() => {
    if (!isTracking) return;

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(drawSkeleton);

    if (
      webcamRef.current &&
      webcamRef.current.video
    ) {
      cameraRef.current = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await pose.send({ image: webcamRef.current!.video! });
        },
        width: 640,
        height: 480,
      });
      cameraRef.current.start();
    }

    return () => {
      cameraRef.current?.stop();
    };
  }, [isTracking]);

  /* ---------------- UI ---------------- */
  return (
    <div className="relative w-[640px] h-[480px] mx-auto">

      {/* Rep Counter */}
      <div className="absolute top-3 left-3 z-30 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-lg">
        Reps: {repCount}
      </div>

      {/* Webcam */}
      <Webcam
        ref={webcamRef}
        mirrored
        width={640}
        height={480}
        className="absolute top-0 left-0 z-10 rounded-lg"
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute top-0 left-0 z-20 pointer-events-none"
      />

      {/* Start / Stop Button */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => {
            setIsTracking((prev) => !prev);
            if (isTracking) {
              setRepCount(0);
              setIsSquatting(false);
            }
          }}
          className={`px-6 py-2 rounded-lg text-white ${
            isTracking ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {isTracking ? "Stop Tracking" : "Start Tracking"}
        </button>
      </div>
    </div>
  );
};

export default LivePoseTracker;