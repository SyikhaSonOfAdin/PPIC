import { PoolConnection } from "mysql2/promise";
import { projectDetailServices } from "../services/projectDetail";
import { actualServices } from "../services/projectActual";
import { plansServices } from "../services/projectPlans";
import { PPIC } from "../config/db";

export const progressPercentage = async (
  projectId: string,
  conn?: PoolConnection,
) => {
  const connection = conn || (await PPIC.getConnection());
  try {
    const [projectDetail, actualData, plans] = await Promise.all([
      projectDetailServices.get(projectId, connection),
      actualServices.get.all(projectId, connection),
      plansServices.get.all(projectId, connection),
    ]);
    /**
     * @current_actual
     */
    const currActual = actualData
      .filter(
        (p) => new Date(`${p.PERIOD_YEAR}-${p.PERIOD_MONTH}`) <= new Date(),
      )
      .reduce((total, item) => total + Number(item.PERCENTAGE), 0);
    /**
     * @current_plan
     */
    const currPlan = plans
      .filter(
        (p) => new Date(`${p.PERIOD_YEAR}-${p.PERIOD_MONTH}`) <= new Date(),
      )
      .reduce((total, item) => total + Number(item.PERCENTAGE), 0);

    const tempActual = actualData.reduce(
      (sum, item) => sum + Number(item.AMOUNT),
      0,
    );
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
  } catch (error) {
    throw error;
  } finally {
    if (!conn) {
      connection.release();
    }
  }
};
