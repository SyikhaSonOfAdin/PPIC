require('dotenv').config();
const { delayedMaterialListDetailRouter } = require('./routes/delayedMaterialDetail');
const { delayedMaterialListRouter } = require('./routes/delayedMaterialList');
const { projectProductivityRouter } = require('./routes/projectProductivity');
const { productivityPeriodRouter } = require('./routes/productivityPeriod');
const { delayedMaterialRouter } = require('./routes/delayedMaterial');
const { journalDelaysRouter } = require('./routes/journalDelays');
const { journalRemarkRouter } = require('./routes/journalRemark');
const { projectActualRouter } = require('./routes/projectActual');
const { projectPlansRouter } = require('./routes/projectPlans');
const { permissionRouter } = require('./routes/permission');
const { attachmentRouter } = require('./routes/attachment');
const { departmentRouter } = require('./routes/department');
const { categoryRouter } = require('./routes/category');
const { workLoadRouter } = require('./routes/workLoad');
const { companyRouter } = require('./routes/company');
const { projectRouter } = require('./routes/project');
const { processRouter } = require('./routes/process');
const { userRouter } = require('./routes/user');
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// const corsOptions = {
//     origin: ['https://ppic.syikha.com', 'https://server1.ppic.syikha.com'],
//     optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '')));

app.use("/journal/material/delayed/list/detail", delayedMaterialListDetailRouter);
app.use("/journal/material/delayed/list", delayedMaterialListRouter);
app.use("/productivity/progress", projectProductivityRouter);
app.use("/journal/material/delayed", delayedMaterialRouter);
app.use("/productivity/period", productivityPeriodRouter);
app.use("/journal/delays", journalDelaysRouter);
app.use("/journal/remark", journalRemarkRouter);
app.use("/project/actual", projectActualRouter);
app.use("/project/plans", projectPlansRouter);
app.use("/permission", permissionRouter);
app.use("/attachment", attachmentRouter);
app.use("/category", categoryRouter);
app.use("/department", departmentRouter);
app.use("/workload", workLoadRouter);
app.use("/project", projectRouter);
app.use("/process", processRouter);
app.use("/company", companyRouter);
app.use("/user", userRouter);

app.use((req, res) => {
    res.status(404).send(`
        <html>
            <head>
                <style>
                    body {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    h1 {
                        font-size: 48px;
                        font-family: Arial, sans-serif;
                        margin-top: 20px;
                    }
                    svg {
                        width: 100px;
                        height: 100px;
                    }
                </style>
            </head>
            <body>
                <svg id="fi_5089972" enable-background="new 0 0 512 512" height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg"><g><path d="m432.733 0h-353.466c-43.708 0-79.267 35.559-79.267 79.267v353.467c0 43.707 35.559 79.266 79.267 79.266h353.467c43.707 0 79.266-35.559 79.266-79.267v-353.466c0-43.708-35.559-79.267-79.267-79.267zm49.267 432.733c0 27.166-22.101 49.267-49.267 49.267h-353.466c-27.166 0-49.267-22.101-49.267-49.267v-274.2h452zm0-304.2h-452v-49.266c0-27.166 22.101-49.267 49.267-49.267h353.467c27.165 0 49.266 22.101 49.266 49.267z"></path><path d="m95.333 64.267h-16.066c-19.872.733-19.874 29.266 0 30h16.066c19.872-.734 19.874-29.266 0-30z"></path><path d="m167.634 64.267h-16.067c-19.872.733-19.874 29.266 0 30h16.067c19.871-.734 19.874-29.266 0-30z"></path><path d="m239.934 64.267h-16.067c-19.872.733-19.874 29.266 0 30h16.067c19.871-.734 19.874-29.266 0-30z"></path><path d="m242.504 319.79c7.441-7.438 19.551-7.438 26.992 0 5.859 5.857 15.358 5.853 21.213-.006 5.856-5.859 5.854-15.357-.006-21.213-19.135-19.125-50.271-19.125-69.406 0-13.535 14.568 6.628 34.749 21.207 21.219z"></path><path d="m368.467 271c8.284 0 15-6.716 15-15v-16.067c-.733-19.872-29.266-19.874-30 0v16.067c0 8.284 6.716 15 15 15z"></path><path d="m143.533 271c8.284 0 15-6.716 15-15v-16.067c-.733-19.872-29.266-19.874-30 0v16.067c0 8.284 6.716 15 15 15z"></path></g></svg>
                
            </body>
        </html>
    `);
});

app.listen(process.env.PORT || port, () => {
    console.log(`Server berjalan di port ${port} on http://localhost:${port}`);
});
