import { Router } from "express";
import { RegisterDoctor } from "../controller/Doctor.controller";

const DoctorRouter = Router();



// 
DoctorRouter.get("/", RegisterDoctor);













export default DoctorRouter;