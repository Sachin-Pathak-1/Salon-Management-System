const Attendance = require("../models/Attendance");
const Staff = require("../models/Staff");

// Create or update attendance record
exports.createOrUpdateAttendance = async (req, res) => {
  try {
    const { staffId, salonId, date, status, notes } = req.body;

    // Validation
    if (!staffId || !salonId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: staffId, salonId, date, status"
      });
    }

    if (!["present", "absent", "leave"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be present, absent, or leave"
      });
    }

    // Verify staff exists and belongs to salon
    const staff = await Staff.findById(staffId);
    if (!staff || staff.salonId.toString() !== salonId) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found or doesn't belong to this salon"
      });
    }

    // Find or create attendance record
    let attendance = await Attendance.findOne({
      staffId,
      date
    });

    if (attendance) {
      // Update existing record
      attendance.status = status;
      attendance.notes = notes || attendance.notes;
      attendance.updatedAt = new Date();
      await attendance.save();
    } else {
      // Create new record
      attendance = await Attendance.create({
        staffId,
        salonId,
        date,
        status,
        notes: notes || ""
      });
    }

    res.status(201).json({
      success: true,
      message: "Attendance record updated successfully",
      data: attendance
    });
  } catch (error) {
    console.error("Error in createOrUpdateAttendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating/updating attendance",
      error: error.message
    });
  }
};

// Get attendance for a staff member
exports.getStaffAttendance = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { startDate, endDate, salonId } = req.query;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "staffId is required"
      });
    }

    let query = { staffId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = startDate;
      }
      if (endDate) {
        query.date.$lte = endDate;
      }
    }

    // Add salon filter if provided
    if (salonId) {
      query.salonId = salonId;
    }

    const attendance = await Attendance.find(query)
      .populate("staffId", "name email designation")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error("Error in getStaffAttendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching attendance",
      error: error.message
    });
  }
};

// Get attendance for all staff in a salon for a date range
exports.getSalonAttendance = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { startDate, endDate } = req.query;

    if (!salonId) {
      return res.status(400).json({
        success: false,
        message: "salonId is required"
      });
    }

    let query = { salonId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = startDate;
      }
      if (endDate) {
        query.date.$lte = endDate;
      }
    }

    const attendance = await Attendance.find(query)
      .populate("staffId", "name email designation specialization")
      .sort({ date: -1, staffId: 1 });

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error("Error in getSalonAttendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching salon attendance",
      error: error.message
    });
  }
};

// Get attendance summary for a staff member
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { month, year } = req.query;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "staffId is required"
      });
    }

    // Build date range for the month
    const startDate = `${year || new Date().getFullYear()}-${String(month || new Date().getMonth() + 1).padStart(2, "0")}-01`;
    const nextMonth = new Date(`${startDate}-01`);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const endDate = nextMonth.toISOString().split("T")[0];

    const attendance = await Attendance.find({
      staffId,
      date: { $gte: startDate, $lt: endDate }
    });

    const summary = {
      present: attendance.filter((a) => a.status === "present").length,
      absent: attendance.filter((a) => a.status === "absent").length,
      leave: attendance.filter((a) => a.status === "leave").length,
      total: attendance.length
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error("Error in getAttendanceSummary:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching attendance summary",
      error: error.message
    });
  }
};

// Delete attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const attendance = await Attendance.findByIdAndDelete(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteAttendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting attendance",
      error: error.message
    });
  }
};
