import { useState, useEffect } from 'react'
import { Stage, Layer, Rect, Text } from 'react-konva';
import './App.css'

function App() {
  const [message, setMessage] = useState("Loading...")

  useEffect(() => {
    fetch("/api/")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Backend Offline"))
  }, []);

  return (
    <div className="App">
      <h1>Garden Planning Tool</h1>
      <div className="card">
        <p>System Status: <strong>{message}</strong></p>
      </div>
      <Stage width={800} height={600}>
      <Layer>
        <Rect x={50} y={100} width={700} height={500} stroke="white" strokeWidth={1} />
        <Text x={50} y={70} 
              text="Garden Grid" 
              fontSize={22} 
              fontFamily="Roboto, sans-serif" 
              fontStyle='bold'
              fill="#FFFFFF"  />
      </Layer>
    </Stage>
    </div>
  )

}

export default App
