const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true
        },
        salonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Salon",
            required: true
        },
        records: [
            {
                staffId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Staff",
                    required: true
                },
                staffName: { type: String }, // redundant but useful for quick display
                status: {
                    type: String,
                    enum: ["Present", "Absent", "Half Day", "Leave"],
                    default: "Absent"
                },
                checkIn: { type: String, default: "" },  // e.g. "09:00 AM"
                checkOut: { type: String, default: "" }, // e.g. "06:00 PM"
                remarks: { type: String, default: "" }
            }
        ]
    },
    { timestamps: true }
);

// Compound index to ensure one attendance record per salon per date
attendanceSchema.index({ salonId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
