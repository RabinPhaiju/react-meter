import Meter, { useMeter } from './Meter'

function App() {
  const { value, setValue } = useMeter(123.45);

  return (
    <div className="App">
      <Meter value={value} onChange={setValue} />
      <button onClick={() => setValue(value + 1)}>Increment by 1</button>
      <button onClick={() => setValue(Math.max(0, value - 1))}>Decrement by 1</button>
    </div>
  )
}

export default App
