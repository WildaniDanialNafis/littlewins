import { BrowserRouter } from "react-router-dom";

import { Providers } from "./providers";
import AppRouter from "./router";

const App = () => {
  return (
    <BrowserRouter>
      <Providers>
        <AppRouter />
      </Providers>
    </BrowserRouter>
  );
};

App.displayName = "App";

export default App;
