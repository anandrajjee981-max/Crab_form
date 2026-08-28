import { configDotenv } from "dotenv";

configDotenv(); 
if(! process.env.GOOGLE_API_KEY){
throw new Error("google api key not defined")
}








