import { BrowserRouter as Router,Route,Routes } from "react-router-dom"
import { Home,Auth,Orders } from "./pages"
import Header from './components/shared/Headers'
function App() {

  

  return (
    <>
      <Router>
        <Header/>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/auth" element={<Auth/>}></Route>
          <Route path="/orders" element={<Orders/>}></Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
