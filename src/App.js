import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useActionData } from "react-router-dom";
import Chat from './pages/Chat';

function App() {
  return (
    <div>
    <div className="App">
      <Routes>
          <Route path='/' element={<Chat />} />ß
      </Routes>
    </div>
  </div>
  );
}

export default App;
