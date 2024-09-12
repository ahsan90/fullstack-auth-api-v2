import app from "./app";
import { seedUsers } from "./config/data";
import { connectDb } from "./config/db";
import envConfig from "./config/env";

const startServer = async () => {
    try {
        await connectDb();
        app.listen(envConfig.port, () => {
            console.log(`Server started on port ${envConfig.port}`);
        });
        await seedUsers();
    } catch (error) {
        console.log("Error starting server: ", error);
        process.exit(1);
    }
};

startServer();