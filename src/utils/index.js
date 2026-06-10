"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressPercentage = void 0;
const projectDetail_1 = require("../services/projectDetail");
const projectActual_1 = require("../services/projectActual");
const projectPlans_1 = require("../services/projectPlans");
const db_1 = require("../config/db");
const progressPercentage = async (projectId, conn) => {
    const connection = conn || (await db_1.PPIC.getConnection());
    try {
        const [projectDetail, actualData, plans] = await Promise.all([
            projectDetail_1.projectDetailServices.get(projectId, connection),
            projectActual_1.actualServices.get.all(projectId, connection),
            projectPlans_1.plansServices.get.all(projectId, connection),
        ]);
        /**
         * @current_actual
         */
        const currActual = actualData
            .filter((p) => new Date(`${p.PERIOD_YEAR}-${p.PERIOD_MONTH}`) <= new Date())
            .reduce((total, item) => total + Number(item.PERCENTAGE), 0);
        /**
         * @current_plan
         */
        const currPlan = plans
            .filter((p) => new Date(`${p.PERIOD_YEAR}-${p.PERIOD_MONTH}`) <= new Date())
            .reduce((total, item) => total + Number(item.PERCENTAGE), 0);
        const tempActual = actualData.reduce((sum, item) => sum + Number(item.AMOUNT), 0);
        const tempPlans = Number(plans[plans.length - 1]?.AMOUNT ?? 0);
        /**
         * @result
         */
        // prettier-ignore
        const percentage = tempActual > 0 ? (tempActual / Number(projectDetail.CAPACITY)) * 100 : 0;
        const deviation = (currActual - currPlan).toFixed(2);
        const actual = `${new Intl.NumberFormat("id-ID").format(tempPlans)} / ${new Intl.NumberFormat("id-ID").format(tempActual)}`;
        return {
            percentage,
            deviation,
            actual,
            actualProgress: tempActual,
            actualPlans: tempPlans,
        };
    }
    catch (error) {
        throw error;
    }
    finally {
        if (!conn) {
            connection.release();
        }
    }
};
exports.progressPercentage = progressPercentage;
