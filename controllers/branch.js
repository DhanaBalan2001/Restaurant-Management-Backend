import Branch from '../models/Branch.js';

export const createBranch = async (req, res) => {
  try {
      const branchData = {
          name: req.body.name,
          location: {
              address: req.body.location.address,
              city: req.body.location.city
          },
          contactNumber: req.body.contactNumber,
          manager: req.body.manager,
          email: req.body.email,
          status: req.body.status || 'active',
          operatingHours: req.body.operatingHours
      };
      const newBranch = await Branch.create(branchData);
      res.status(201).json(newBranch);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const getAllBranches = async (req, res) => {
  try {
      const branches = await Branch.find().lean();
      if (branches.length === 0) {
          return res.json([]);
      }
      res.json(branches);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const getBranchById = async (req, res) => {
try {
  const branch = await Branch.findById(req.params.id)
    .populate('tables')
    .populate('staff');
  if (!branch) {
    return res.status(404).json({ message: "Branch not found" });
  }
  res.json(branch);
} catch (error) {
  res.status(500).json({ message: error.message });
}
};

export const updateBranch = async (req, res) => {
try {
    const updatedBranch = await Branch.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.json(updatedBranch);
} catch (error) {
    res.status(500).json({ message: error.message });
}
};
export const updateBranchStatus = async (req, res) => {
try {
  const { status } = req.body;
  const updatedBranch = await Branch.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  res.json(updatedBranch);
} catch (error) {
  res.status(500).json({ message: error.message });
}
};