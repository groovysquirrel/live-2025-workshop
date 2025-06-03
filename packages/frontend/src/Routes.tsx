import { Route, Routes } from "react-router-dom";
import Home from "./containers/Home.tsx";
import Notes from "./containers/Notes.tsx";
import NewNote from "./containers/NewNote.tsx";
import Page2 from "./containers/Page2.tsx";
import Page3 from "./containers/Page3.tsx";
import NotFound from "./containers/NotFound.tsx";

export default function Links() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/page2" element={<Page2 />} />
      <Route path="/page3" element={<Page3 />} />
      <Route path="/notes/new" element={<NewNote />} />
      <Route path="/notes/:id" element={<Notes />} />
      {/* Finally, catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />;
    </Routes>
  );
}
