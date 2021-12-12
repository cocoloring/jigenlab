import type { NextPage } from 'next'
import { useCallback, useEffect, useRef, useState } from 'react'

import * as Holistic from '@mediapipe/holistic'
import * as DrawingUtils from '@mediapipe/drawing_utils'

const CaptionPage: NextPage = () => {
    const videoRefer = useRef<HTMLVideoElement>()
    const canvasRefer = useRef<HTMLCanvasElement>()

    const connect = useCallback(
        function connect(
            ctx: CanvasRenderingContext2D,
            connectors:
                Array<[Holistic.NormalizedLandmark, Holistic.NormalizedLandmark]>):
            void {
            const canvas = ctx.canvas;
            for (const connector of connectors) {
                const from = connector[0];
                const to = connector[1];
                if (from && to) {
                    if (from.visibility && to.visibility &&
                        (from.visibility < 0.1 || to.visibility < 0.1)) {
                        continue;
                    }
                    ctx.beginPath();
                    ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
                    ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
                    ctx.stroke();
                }
            }
        }
        , []
    )

    const [activeEffect, setActiveEffect] = useState<string>('mask');

    const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D>(null);


    const onResults = useCallback((results: Holistic.Results): void => {
        (window as any).a = results
        const canvasElement = canvasRefer.current

        if (!canvasElement || !canvasCtx) {
            return
        }

        // Remove landmarks we don't want to draw.
        if (results.poseLandmarks) {
            const elements = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 18, 19, 20, 21, 22]
            for (const element of elements) {
                delete results.poseLandmarks[element];
            }
        }

        // Draw the overlays.
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Connect elbows to hands. Do this first so that the other graphics will draw
        // on top of these marks.
        canvasCtx.lineWidth = 5;
        if (results.poseLandmarks) {
            if (results.rightHandLandmarks) {
                canvasCtx.strokeStyle = 'white';
                connect(canvasCtx, [[
                    results.poseLandmarks[Holistic.POSE_LANDMARKS.RIGHT_ELBOW],
                    results.rightHandLandmarks[0]
                ]]);
            }
            if (results.leftHandLandmarks) {
                canvasCtx.strokeStyle = 'white';
                connect(canvasCtx, [[
                    results.poseLandmarks[Holistic.POSE_LANDMARKS.LEFT_ELBOW],
                    results.leftHandLandmarks[0]
                ]]);
            }
        }

        if (results.poseLandmarks) {
            // Pose...
            DrawingUtils.drawConnectors(
                canvasCtx, results.poseLandmarks, Holistic.POSE_CONNECTIONS,
                { color: 'white' });
            DrawingUtils.drawLandmarks(
                canvasCtx,
                Object.values(Holistic.POSE_LANDMARKS_LEFT)
                    .map(index => results.poseLandmarks[index]),
                { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(255,138,0)' });
            DrawingUtils.drawLandmarks(
                canvasCtx,
                Object.values(Holistic.POSE_LANDMARKS_RIGHT)
                    .map(index => results.poseLandmarks[index]),
                { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(0,217,231)' });
        }


        // Hands...
        DrawingUtils.drawConnectors(
            canvasCtx, results.rightHandLandmarks, Holistic.HAND_CONNECTIONS,
            { color: 'white' });
        DrawingUtils.drawLandmarks(canvasCtx, results.rightHandLandmarks, {
            color: 'white',
            fillColor: 'rgb(0,217,231)',
            lineWidth: 2,
            radius: (data: DrawingUtils.Data) => {
                return DrawingUtils.lerp(data.from!.z!, -0.15, .1, 10, 1);
            }
        });
        DrawingUtils.drawConnectors(
            canvasCtx, results.leftHandLandmarks, Holistic.HAND_CONNECTIONS,
            { color: 'white' });
        DrawingUtils.drawLandmarks(canvasCtx, results.leftHandLandmarks, {
            color: 'white',
            fillColor: 'rgb(255,138,0)',
            lineWidth: 2,
            radius: (data: DrawingUtils.Data) => {
                return DrawingUtils.lerp(data.from!.z!, -0.15, .1, 10, 1);
            }
        });

        // Face...
        DrawingUtils.drawConnectors(
            canvasCtx, results.faceLandmarks, Holistic.FACEMESH_TESSELATION,
            { color: '#C0C0C070', lineWidth: 1 });
        DrawingUtils.drawConnectors(
            canvasCtx, results.faceLandmarks, Holistic.FACEMESH_RIGHT_EYE,
            { color: 'rgb(0,217,231)', lineWidth: 1 });
        DrawingUtils.drawConnectors(
            canvasCtx, results.faceLandmarks, Holistic.FACEMESH_RIGHT_EYEBROW,
            { color: 'rgb(0,217,231)', lineWidth: 1 });
        DrawingUtils.drawConnectors(
            canvasCtx, results.faceLandmarks, Holistic.FACEMESH_LEFT_EYE,
            { color: 'rgb(255,138,0)', lineWidth: 1 });
        DrawingUtils.drawConnectors(
            canvasCtx, results.faceLandmarks, Holistic.FACEMESH_LEFT_EYEBROW,
            { color: 'rgb(255,138,0)', lineWidth: 1 });
        DrawingUtils.drawConnectors(
            canvasCtx, results.faceLandmarks, Holistic.FACEMESH_FACE_OVAL,
            { color: '#E0E0E0', lineWidth: 1 });
        DrawingUtils.drawConnectors(
            canvasCtx, results.faceLandmarks, Holistic.FACEMESH_LIPS,
            { color: '#E0E0E0', lineWidth: 1 });

        DrawingUtils.drawConnectors(
            canvasCtx, results.faceLandmarks, [468, 469, 470, 471, 472].map((v, i, a) => [v, a[i + 1 % a.length]]),
            { color: 'rgb(255,64,0)', lineWidth: 5 });

        canvasCtx.restore();
    }
        , [canvasCtx, canvasRefer.current])

    const [mediapipe, setMediapipe] = useState<Holistic.Holistic>(null)

    useEffect(() => {
        if (mediapipe && videoRefer.current) {
            const timer = setInterval(() => {
                mediapipe.send({
                    image: videoRefer.current
                })
            }, 1000 / 30)
            return () => {
                clearInterval(timer)
            }
        }
    }, [mediapipe, videoRefer.current])

    const startCaption = useCallback(async () => {
        if (videoRefer.current) {
            const config = {
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@` +
                        `${Holistic.VERSION}/${file}`;
                }
            };
            const holistic = new Holistic.Holistic(config)
            await holistic.initialize()
            setMediapipe(holistic)
            holistic.onResults(onResults);
            console.log('Holistic start')
        }
    }, [videoRefer.current,])

    const openCamera = useCallback(() => {
        if (videoRefer.current) {
            navigator.mediaDevices.getUserMedia({ audio: false, video: true })
                .then(function (stream) {
                    const videoElement = videoRefer.current
                    videoElement.srcObject = stream
                    videoElement.play();
                })
                .catch(function (err) {
                    console.error(err)
                });
        }
    }, [videoRefer.current])

    return <div>
        <div style={{
            position: "relative"
        }}>
            <video className={"input_video"} ref={videoRefer} style={{
                transform: "scale(-1, 1)",
                position: "relative",
                width: "800px",
                height: "600px",
            }} />
            <canvas width="800px" height="600px"
                style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "800px",
                    height: "600px",
                    transform: "scale(-1, 1)"
                }}
                ref={(el) => {
                    canvasRefer.current = el

                    if (el) {
                        setCanvasCtx(el.getContext('2d'))
                    }
                }} />
        </div>
        <div>
            <button onClick={openCamera}>open camera</button>
            <button onClick={startCaption}>caption</button>
        </div>
    </div>
}

export default CaptionPage