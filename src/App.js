import React from 'react';
import './App.css';

function App(props) {
  console.log('App Component')
  return (
    <div className="App">
      App
      {/* {React.Children.toArray(props.children)} */}
    </div>
  );
}

export default App;
