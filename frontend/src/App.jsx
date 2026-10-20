import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Home           from './pages/Home';
import Login          from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard      from './pages/Dashboard';
import Courses        from './pages/Courses';
import Category       from './pages/Category';
import Course         from './pages/Course';
import Profile        from './pages/Profile';
import Grades         from './pages/Grades';
import Calendar       from './pages/Calendar';
import Search         from './pages/Search';
import EBook          from './pages/EBook';
import Assignment     from './pages/Assignment';

export default function App() {
  return (
    <Routes>
      <Route path="/"             element={<Home />} />
      <Route path="/login"        element={<Login />} />
      <Route path="/forgot"       element={<ForgotPassword />} />
      <Route path="/courses"      element={<Courses />} />
      <Route path="/category/:id" element={<Category />} />
      <Route path="/course/:id"   element={<Course />} />
      <Route path="/search"       element={<Search />} />
      <Route path="/calendar"     element={<Calendar />} />
      <Route path="/ebook"        element={<EBook />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"                            element={<Dashboard />} />
        <Route path="/profile"                              element={<Profile />} />
        <Route path="/grades"                               element={<Grades />} />
        <Route path="/assignment/by-name/:courseId"         element={<Assignment />} />
        <Route path="/assignment/:id"                       element={<Assignment />} />
      </Route>
    </Routes>
  );
}
