import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { LibraryProvider } from "./context/LibraryContext";

function LayoutContent() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default function AppLayout() {
  return (
    <LibraryProvider>
      <LayoutContent />
    </LibraryProvider>
  );
}
