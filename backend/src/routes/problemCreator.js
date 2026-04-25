const express = require('express');

const problemRouter =  express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem} = require("../controllers/userProblem");
const { getLeetCodeProblem } = require("../controllers/leetcodeController");
const userMiddleware = require("../middleware/userMiddleware");


// Create
problemRouter.post("/create",adminMiddleware ,createProblem);
problemRouter.put("/update/:id",adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware, deleteProblem);
problemRouter.get("/fetch-leetcode/:slug", adminMiddleware, getLeetCodeProblem);


problemRouter.get("/problemById/:id",userMiddleware,getProblemById);
problemRouter.get("/getAllProblem",userMiddleware, getAllProblem);
problemRouter.get("/problemSolvedByUser",userMiddleware, solvedAllProblembyUser);
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);


module.exports = problemRouter;

// fetch
// update
// delete 
