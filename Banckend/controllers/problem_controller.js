import Problem from "../model/problem_model.js";

export const addProblem = async (req, res) => {
    try {
        const { patientId, symptoms, diagnosis, treatment } = req.body;
        const doctorId = req.user._id;

        if (!patientId || !symptoms || !diagnosis || !treatment) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newProblem = new Problem({
            patient: patientId,
            doctor: doctorId,
            symptoms,
            diagnosis,
            treatment,
            status: "active"
        });

        await newProblem.save();
        res.status(201).json({ message: "Problem added successfully", problem: newProblem });
    } catch (error) {
        console.error("Error adding problem:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getPatientProblems = async (req, res) => {
    try {
        const { patientId } = req.params;
        const problems = await Problem.find({ patient: patientId })
            .populate("doctor", "username specialization")
            .sort({ createdAt: -1 }); // Newest first by default

        res.status(200).json(problems);
    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const resolveProblem = async (req, res) => {
    try {
        const { problemId } = req.params;
        const problem = await Problem.findByIdAndUpdate(
            problemId,
            { status: "resolved", resolvedAt: new Date() },
            { new: true }
        );

        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        res.status(200).json({ message: "Problem marked as resolved", problem });
    } catch (error) {
        console.error("Error resolving problem:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const getMyProblems = async (req, res) => {
    try {
        const patientId = req.user._id;
        const problems = await Problem.find({ patient: patientId })
            .populate("doctor", "username specialization")
            .sort({ createdAt: -1 });

        res.status(200).json(problems);
    } catch (error) {
        console.error("Error fetching my problems:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
