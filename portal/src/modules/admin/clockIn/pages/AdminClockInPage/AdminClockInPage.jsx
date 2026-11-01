import { useState } from "react";
import MyClockIn from "../../components/MyClockIn";
import AttendanceOverview from "../../components/AttendanceOverview";

const AdminClockInPage = () => {
  const [view, setView] = useState("clockin");

  return view === "attendance" ? (
    <AttendanceOverview onBack={() => setView("clockin")} />
  ) : (
    <MyClockIn onViewAttendance={() => setView("attendance")} />
  );
};

export default AdminClockInPage;