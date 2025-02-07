import { useState } from 'react'
import ChessBoard from './components/Chessboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ChessBoard/>
    </>
  )
}

export default App
