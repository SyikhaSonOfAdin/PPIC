const { PPIC } = require("../config/db")
const { categoryServices } = require("../services/category")
const { projectServices } = require("../services/project")
const { actualServices } = require("../services/projectActual")
const { plansServices } = require("../services/projectPlans")
const { workLoadServices } = require("../services/workLoad")

const categoryControllers = {
    add: async (req, res, next) => {
        const { companyId, userId, name, description, uom } = req.body
        if (!companyId || !userId || !name || !uom) return res.status(400).json({ message: "Invalid Parameter" })

        try {
            const id = await categoryServices.add(companyId, userId, name, description, uom)
            return res.status(200).json({
                message: "Category added successfully",
                data: [{
                    categoryId: id,
                }]
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    delete: {
        onlyOne: async (req, res, next) => {
            const { rowId } = req.body
            if (!rowId) return res.status(400).json({ message: "Invalid Parameter" })
            try {
                await categoryServices.delete.onlyOne(rowId)
                return res.status(200).json({
                    message: "Category deleted successfully",
                    data: []
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
    },
    edit: async (req, res, next) => {
        const { rowId, userId, name, description, uom } = req.body
        if (!rowId || !userId || !name || !uom) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            await categoryServices.edit(rowId, name, description, uom, userId)
            return res.status(200).json({
                message: "Category edited successfully",
                data: []
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    get: {
        all: async (req, res, next) => {
            const companyId = req.params.companyId
            if (!companyId) return res.status(400).json({ message: "Invalid Parameter" })
            try {
                const data = await categoryServices.get.all(companyId)
                return res.status(200).json({
                    message: "Get Category successfully",
                    data: data
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        detail: async (req, res, next) => {
            const companyId = req.params.companyId;
            const categoryId = req.params.categoryId;
            const year = req.query.y;

            if (!companyId || !categoryId || !year) {
                return res.status(400).json({ message: "Invalid Parameter" });
            }

            const months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];

            try {
                const connection = await PPIC.getConnection();
                try {
                    await connection.beginTransaction();

                    const [category] = await categoryServices.get.onlyOne(categoryId, connection);

                    const periods = new Set();
                    var uniqueLabels;

                    const mainChart = await (async () => {
                        const workLoad = await workLoadServices.get.onlyOne.byYear(categoryId, year, connection);
                        const projectsAtributes = await projectServices.get.byCategoryId(categoryId, connection);

                        const plansData = await Promise.all(
                            projectsAtributes.map(async (project) => {
                                const plans = await plansServices.get.all(project.ID, connection);
                                return plans.map((i) => {
                                    return {
                                        ...i,
                                        PROJECT_ID: project.ID,
                                        PROJECT_NO: project.PROJECT_NO,
                                        CLIENT: project.CLIENT,
                                    }
                                });
                            })
                        );
                        const actualData = await Promise.all(
                            projectsAtributes.map(async (project) => {
                                const actual = await actualServices.get.all(project.ID, connection);
                                return actual.map((i) => {
                                    return {
                                        ...i,
                                        PROJECT_ID: project.ID,
                                        PROJECT_NO: project.PROJECT_NO,
                                        CLIENT: project.CLIENT,
                                    }
                                });
                            })
                        );
                        plansData.flat().forEach((eachData) => {
                            const monthIndex = parseInt(eachData.PERIOD_MONTH.split("-")[0], 10) - 1;
                            if (monthIndex >= 0 && monthIndex < months.length && eachData.PERIOD_YEAR == year) {
                                periods.add(`${eachData.PERIOD_YEAR} / ${months[monthIndex]}`);
                            }
                        });
                        actualData.flat().forEach((eachData) => {
                            const monthIndex = parseInt(eachData.PERIOD_MONTH.split("-")[0], 10) - 1;
                            if (monthIndex >= 0 && monthIndex < months.length && eachData.PERIOD_YEAR == year) {
                                periods.add(`${eachData.PERIOD_YEAR} / ${months[monthIndex]}`);
                            }
                        });
                        uniqueLabels = Array.from(periods).sort((a, b) => {
                            const [yearA, monthA] = a.split(" / ");
                            const [yearB, monthB] = b.split(" / ");
                            const yearAInt = parseInt(yearA, 10);
                            const yearBInt = parseInt(yearB, 10);
                            if (yearAInt === yearBInt) {
                                return months.indexOf(monthA) - months.indexOf(monthB);
                            }
                            return yearAInt - yearBInt;
                        });

                        return {
                            CATEGORY_NAME: category.NAME,
                            CATEGORY_ID: categoryId,
                            UOM: category.UOM,
                            WORK_LOAD: uniqueLabels.map((label) => ({
                                x: label,
                                y: workLoad.length > 0 ? workLoad[0].WORK_LOAD : null,
                            })),
                            PLANS: uniqueLabels.map((label) => {
                                const [year, month] = label.split(" / ");
                                const planItem = plansData.flat().filter(
                                    (item) => item.PERIOD_YEAR == year && months[parseInt(item.PERIOD_MONTH.split("-")[0], 10) - 1] === month
                                );
                                const totalAmount = planItem.reduce((total, item) => {
                                    return total + (parseInt(item.AMOUNT) || 0);
                                }, 0);
                                return {
                                    x: label,
                                    y: totalAmount,
                                    detail: planItem.map((i) => {
                                        return {
                                            PROJECT_ID: i.PROJECT_ID,
                                            PROJECT_NO: i.PROJECT_NO,
                                            CLIENT: i.CLIENT,
                                            AMOUNT: parseInt(i.AMOUNT) || 0,
                                        }
                                    }).reduce((acc, item) => {
                                        const existing = acc.find(obj => obj.PROJECT_ID === item.PROJECT_ID);
                                        if (existing) {
                                            existing.AMOUNT += item.AMOUNT;
                                        } else {
                                            acc.push({ ...item });
                                        }
                                        return acc;
                                    }, [])
                                };
                            }),
                            ACTUAL: uniqueLabels.map((label) => {
                                const [year, month] = label.split(" / ");
                                const actualItem = actualData.flat().filter(
                                    (item) =>
                                        item.PERIOD_YEAR == year &&
                                        months[parseInt(item.PERIOD_MONTH.split("-")[0], 10) - 1] === month
                                );
                                const totalAmount = actualItem.reduce((total, item) => {
                                    return total + (parseInt(item.AMOUNT) || 0);
                                }, 0);
                                return {
                                    x: label,
                                    y: totalAmount,
                                    detail: actualItem.map((i) => {
                                        return {
                                            PROJECT_ID: i.PROJECT_ID,
                                            PROJECT_NO: i.PROJECT_NO,
                                            CLIENT: i.CLIENT,
                                            AMOUNT: parseInt(i.AMOUNT) || 0,
                                        }
                                    }).reduce((acc, item) => {
                                        const existing = acc.find(obj => obj.PROJECT_ID === item.PROJECT_ID);
                                        if (existing) {
                                            existing.AMOUNT += item.AMOUNT;
                                        } else {
                                            acc.push({ ...item });
                                        }
                                        return acc;
                                    }, [])
                                };
                            }),
                        };
                    })();


                    await connection.commit();
                    return res.status(200).json({
                        message: "get data successfully",
                        data: mainChart,
                    });
                } catch (error) {
                    await connection.rollback();
                    return res.status(500).json({
                        message: error.message,
                    });
                } finally {
                    connection.release();
                }
            } catch (error) {
                res.status(500).json({
                    message: error.message,
                });
            }
        }

    }
}

module.exports = {
    categoryControllers
}