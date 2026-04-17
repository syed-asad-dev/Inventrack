import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ children, onLogout }) => {
  return (
    <div className="flex bg-[#f5f5f5] min-h-screen font-inter">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar />
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
