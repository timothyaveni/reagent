import React from 'react';
import './App.css';
import Editor from './noggin-editor/text-completion/Editor';
import { Header } from './Header';

function App() {
  return (
    <div className="App">
      <Header />
      <Editor />
    </div>
  );
}

export default App;
