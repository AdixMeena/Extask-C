import { AnimatePresence } from 'framer-motion';
import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import PageTransition from './components/motion/PageTransition.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { Skeleton } from './components/Skeleton.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx'; // eager: it is the first thing most people see

// Every other page is its own chunk, downloaded only when visited.
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const BrowseTasks = lazy(() => import('./pages/BrowseTasks.jsx'));
const TaskDetail = lazy(() => import('./pages/TaskDetail.jsx'));
const PostTask = lazy(() => import('./pages/PostTask.jsx'));
const MyTasks = lazy(() => import('./pages/MyTasks.jsx'));
const MyBids = lazy(() => import('./pages/MyBids.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// function ScrollToTop() {
//   const { pathname } = useLocation();
//   useEffect(() => window.scrollTo(0, 0), [pathname]);
//   return null;
// }

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const OwnProfileRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={`/profile/${user.id}`} replace />;
};

const PageLoader = () => (
  <div className="container section">
    <Skeleton height={36} width="45%" />
  </div>
);

export default function App() {
  const location = useLocation();
  const page = (element) => <PageTransition>{element}</PageTransition>;
  const guarded = (element) => <ProtectedRoute>{page(element)}</ProtectedRoute>;

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollToTop />
      <Navbar />
      <main id="main" className="main">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={page(<Home />)} />
              <Route path="/login" element={page(<Login />)} />
              <Route path="/register" element={page(<Register />)} />
              <Route path="/tasks" element={page(<BrowseTasks />)} />
              <Route path="/tasks/:id" element={page(<TaskDetail />)} />
              <Route path="/post" element={guarded(<PostTask />)} />
              <Route path="/my-tasks" element={guarded(<MyTasks />)} />
              <Route path="/my-bids" element={guarded(<MyBids />)} />
              <Route path="/profile" element={<ProtectedRoute><OwnProfileRedirect /></ProtectedRoute>} />
              <Route path="/profile/:id" element={page(<Profile />)} />
              <Route path="*" element={page(<NotFound />)} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
