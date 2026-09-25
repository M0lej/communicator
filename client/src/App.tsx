import { useEffect } from "react";
import "./App.css";
import axios from "axios";

function App() {
  useEffect(() => {
    fetchData();
  });

  const fetchData = async () => {
    await axios.get("/users").then((response) => console.log(response.data));
  };
  return (
    <>
      <h1>Test</h1>
    </>
  );
}

export default App;
