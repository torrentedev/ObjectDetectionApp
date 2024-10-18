import React, { useRef, useEffect, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs';
import './App.css';


const translationDict = {
 'person': 'persona',
  'bicycle': 'bicicleta',
  'car': 'coche',
  'motorcycle': 'motocicleta',
  'airplane': 'avión',
  'bus': 'autobús',
  'train': 'tren',
  'truck': 'camión',
  'boat': 'barco',
  'traffic light': 'semáforo',
  'fire hydrant': 'hidrante',
  'stop sign': 'señal de alto',
  'parking meter': 'parquímetro',
  'bench': 'banco',
  'bird': 'pájaro',
  'cat': 'gato',
  'dog': 'perro',
  'horse': 'caballo',
  'sheep': 'oveja',
  'cow': 'vaca',
  'elephant': 'elefante',
  'bear': 'oso',
  'zebra': 'cebra',
  'giraffe': 'jirafa',
  'backpack': 'mochila',
  'umbrella': 'paraguas',
  'handbag': 'bolso',
  'tie': 'corbata',
  'suitcase': 'maleta',
  'frisbee': 'frisbee',
  'skis': 'esquís',
  'snowboard': 'tabla de snowboard',
  'sports ball': 'pelota',
  'kite': 'cometa',
  'baseball bat': 'bate de béisbol',
  'baseball glove': 'guante de béisbol',
  'skateboard': 'patineta',
  'surfboard': 'tabla de surf',
  'tennis racket': 'raqueta de tenis',
  'bottle': 'botella',
  'wine glass': 'copa de vino',
  'cup': 'taza',
  'fork': 'tenedor',
  'knife': 'cuchillo',
  'spoon': 'cuchara',
  'bowl': 'bol',
  'banana': 'plátano',
  'apple': 'manzana',
  'sandwich': 'sándwich',
  'orange': 'naranja',
  'broccoli': 'brócoli',
  'carrot': 'zanahoria',
  'hot dog': 'perrito caliente',
  'pizza': 'pizza',
  'donut': 'dona',
  'cake': 'pastel',
  'chair': 'silla',
  'couch': 'sofá',
  'potted plant': 'planta en maceta',
  'bed': 'cama',
  'dining table': 'mesa de comedor',
  'toilet': 'inodoro',
  'tv': 'televisor',
  'laptop': 'portátil',
  'mouse': 'ratón',
  'remote': 'control remoto',
  'keyboard': 'teclado',
  'cell phone': 'teléfono móvil',
  'microwave': 'microondas',
  'oven': 'horno',
  'toaster': 'tostadora',
  'sink': 'fregadero',
  'refrigerator': 'refrigerador',
  'book': 'libro',
  'clock': 'reloj',
  'vase': 'jarrón',
  'scissors': 'tijeras',
  'teddy bear': 'oso de peluche',
  'hair drier': 'secador de pelo',
  'toothbrush': 'cepillo de dientes'
};

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [objectName, setObjectName] = useState('No conozco este objeto');
  const [detections, setDetections] = useState([]);
  const [customData, setCustomData] = useState([]);
  const [label, setLabel] = useState('');

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  useEffect(() => {
    const initializeCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
      }
    };
    initializeCamera();
  }, [videoRef]);

  const detectObjects = async () => {
    if (model && videoRef.current.readyState === 4) {
      const predictions = await model.detect(videoRef.current);
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (predictions.length > 0) {
        const bestPrediction = predictions[0];
        const translatedName = translationDict[bestPrediction.class] || bestPrediction.class;
        ctx.beginPath();
        ctx.rect(...bestPrediction.bbox);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'green';
        ctx.fillStyle = 'green';
        ctx.stroke();
        ctx.fillText(
          `${translatedName} (${Math.round(bestPrediction.score * 100)}%)`,
          bestPrediction.bbox[0],
          bestPrediction.bbox[1] > 10 ? bestPrediction.bbox[1] - 5 : 10
        );
        setObjectName(translatedName);
        setDetections(predictions.map(prediction => ({
          name: translationDict[prediction.class] || prediction.class,
          score: Math.round(prediction.score * 100)
        })));
      } else {
        setObjectName('No conozco este objeto');
        setDetections([]);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      detectObjects();
    }, 100);
    return () => clearInterval(interval);
  });

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');
    setCustomData([...customData, { label, imageData }]);
  };

  const handleLabelChange = (e) => {
    setLabel(e.target.value);
  };

  const trainModel = async () => {
    console.log('Entrenar modelo con datos:', customData);
    // Aquí debería ir el código para entrenar el modelo personalizado con los datos capturados
    // Código de entrenamiento pendiente
  };

  

  return (
    <div className="App">
      <h1>Detección de objetos</h1>
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
        ></video>
        <canvas ref={canvasRef}></canvas>
        <div className="object-name">{objectName}</div>
      </div>
      <table className="detection-table">
        <thead>
          <tr>
            <th>Objeto Detectado</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          {detections.map((detection, index) => (
            <tr key={index}>
              <td>{detection.name}</td>
              <td>{detection.score}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="captured-images">
        {customData.map((data, index) => (
          <div key={index} className="captured-image">
            <img src={data.imageData} alt={`captured ${data.label}`} />
            <p>{data.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
