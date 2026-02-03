const Service = require("../models/Service");

// GET all services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch services" });
  }
};

// ADD service
exports.addService = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    const service = new Service({
      name,
      description,
      status
    });

    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Failed to add service" });
  }
};

// UPDATE service
exports.updateService = async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

// DELETE service
exports.deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
