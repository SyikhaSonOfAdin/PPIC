const { projectDetailServices } = require("../services/projectDetail");
const { actualServices } = require("../services/projectActual");
const { plansServices } = require("../services/projectPlans");
const { workLoadServices } = require("../services/workLoad");
const { categoryServices } = require("../services/category");
const { projectServices } = require("../services/project");
const { othersQuerys } = require("../models/others");
const { PPIC } = require("../config/db");

const projectControllers = {
    add: async (req, res, next) => {
        const { companyId, categoryId, projectNo, client, userId, name, spk, description, ppm, capacity, workPlace, startDate, dueDate, finishDate } = req.body;
        if (!companyId || !categoryId || !projectNo || !spk || !client || !userId || !capacity || !workPlace || !startDate || !dueDate) return res.status(400).json({ message: "Invalid Parameter" })

        try {
            const connection = await PPIC.getConnection()
            try {
                await connection.beginTransaction()
                const id = await projectServices.add(companyId, categoryId, projectNo, client, userId)
                await projectDetailServices.add(id, userId, name, spk, description, ppm, capacity, workPlace, startDate, dueDate, finishDate)
                await connection.commit()
                return res.status(200).json({
                    message: "Project added successfully",
                    data: [{
                        projectId: id,
                    }]
                })
            } catch (error) {
                await connection.rollback()
                return res.status(500).json({
                    message: error.message
                })
            } finally {
                connection.release()
            }
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    edit: {
        all: async (req, res, next) => {
            const { projectId, categoryId, projectNo, client, userId, name, spk, description, ppm, capacity, workPlace, startDate, dueDate, finishDate } = req.body;
            if (!projectId || !categoryId || !projectNo || !spk || !client || !userId || !capacity || !workPlace || !startDate || !dueDate) return res.status(400).json({ message: "Invalid Parameter" })

            try {
                const connection = await PPIC.getConnection()
                try {
                    await connection.beginTransaction()
                    await projectServices.edit(projectId, categoryId, projectNo, client, userId, connection)
                    await projectDetailServices.edit.all(projectId, userId, name, spk, description, ppm, capacity, workPlace, startDate, dueDate, finishDate, connection)
                    await plansServices.update.percentage(projectId, connection)
                    await actualServices.update.percentage(projectId, connection)
                    await connection.commit()
                    return res.status(200).json({
                        message: "Project edited successfully",
                        data: []
                    })
                } catch (error) {
                    await connection.rollback()
                    return res.status(500).json({
                        message: error.message
                    })
                } finally {
                    connection.release()
                }
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        deliver: async (req, res, next) => {
            const { projectId } = req.body;
            if (!projectId) return res.status(400).json({ message: "Invalid Parameter" })

            try {
                await projectDetailServices.edit.deliver(projectId)
                return res.status(200).json({
                    message: "Project edited successfully",
                    data: []
                })
            } catch (error) {
                return res.status(500).json({
                    message: error.message
                })
            }
        }
    },
    delete: async (req, res, next) => {
        const { projectId } = req.body
        if (!projectId) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            const connection = await PPIC.getConnection()
            try {
                await connection.beginTransaction()
                await projectServices.delete.onlyOne(projectId, connection)
                await projectDetailServices.delete(projectId, connection)
                await plansServices.delete.all(projectId, connection)
                await actualServices.delete.all(projectId, connection)
                await connection.commit()
                return res.status(200).json({
                    message: "Project deleted successfully",
                    data: []
                })
            } catch (error) {
                await connection.rollback()
                return res.status(500).json({
                    message: error.message
                })
            } finally {
                connection.release()
            }
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    get: {
        all: async (req, res, next) => {
            /**
             * @param companyId contains the company identifier of assigned user
             */
            const companyId = req.params.companyId
            /**
             * @param s is an @alias searchQuery
             */
            const s = req.query.s
            /**
             * @param m is an @alias monthIndex
             */
            const m = req.query.m
            /**
             * @param y is an @alias year
             */
            const y = req.query.y

            if (!companyId) return res.status(400).json({ message: "Invalid Parameter" })

            try {
                const connection = await PPIC.getConnection()
                const [periodYear] = await connection.query(othersQuerys.select.distinct.period.year, [companyId, companyId])
                try {
                    await connection.beginTransaction()
                    const data = await projectServices.get.all(companyId, s, connection)
                    const projects = (
                        await Promise.all(
                            data.map(async (item) => {
                                const actual = await actualServices.get.all(item.ID, connection);
                                const totalActual = actual.reduce(
                                    (sum, item) => sum + parseFloat(item.AMOUNT),
                                    0
                                );

                                if (m && y) {
                                    let actualCheck = 0;
                                    let plansCheck = 0;
                                    let realActual = 0;

                                    const plans = await plansServices.get.all(item.ID, connection);

                                    actual.reduce((sum, i) => {
                                        if (parseInt(i.PERIOD_YEAR) == y) {
                                            if (parseInt(i.PERIOD_MONTH.split('-')[0], 10) <= m) {
                                                if (new Date(Number(i.PERIOD_YEAR), Number(i.PERIOD_MONTH.split("-")[0]) - 1, Number(i.PERIOD_MONTH.split("-")[1])) <= new Date(item.DUE_DATE)) {
                                                    realActual += parseFloat(i.PERCENTAGE);
                                                }
                                                actualCheck += parseFloat(i.PERCENTAGE);
                                                return sum + parseFloat(i.PERCENTAGE);
                                            }
                                            return sum;
                                        } else if (parseInt(i.PERIOD_YEAR) < y) {
                                            if (new Date(Number(i.PERIOD_YEAR), Number(i.PERIOD_MONTH.split("-")[0]) - 1, Number(i.PERIOD_MONTH.split("-")[1])) <= new Date(item.DUE_DATE)) {
                                                realActual += parseFloat(i.PERCENTAGE);
                                            }
                                            return sum + parseFloat(i.PERCENTAGE);
                                        }
                                        return sum;
                                    }, 0);

                                    const tempPlans = plans.reduce((sum, i) => {
                                        if (parseInt(i.PERIOD_YEAR) == y) {
                                            if (parseInt(i.PERIOD_MONTH.split('-')[0], 10) <= m) {
                                                // if (parseInt(i.PERIOD_MONTH.split('-')[0], 10) == m) {
                                                //     plansCheck += parseFloat(i.PERCENTAGE);
                                                //     return sum + parseFloat(i.PERCENTAGE);
                                                // }
                                                plansCheck += parseFloat(i.PERCENTAGE);
                                                return sum + parseFloat(i.PERCENTAGE);
                                            }
                                            return sum;
                                        } else if (parseInt(i.PERIOD_YEAR) < y) {
                                            return sum + parseFloat(i.PERCENTAGE);
                                        }
                                        return sum;
                                    }, 0);

                                    if (plansCheck > 0 || actualCheck > 0) {
                                        return {
                                            ...item,
                                            progress: {
                                                PERCENTAGE: totalActual > 0 ? ((totalActual / parseFloat(item.CAPACITY)) * 100).toFixed(2) + "%" : "0%",
                                                PLANS: tempPlans.toFixed(2) + "%",
                                                ACTUAL: realActual.toFixed(2) + "%",
                                                DEVIATION: (realActual.toFixed(2) - tempPlans.toFixed(2)).toFixed(2) + "%",
                                            },
                                        };
                                    }
                                    return null;
                                }

                                return {
                                    ...item,
                                    progress: {
                                        PERCENTAGE: totalActual > 0 ? ((totalActual / parseFloat(item.CAPACITY)) * 100).toFixed(2) + "%" : "0%",
                                    },
                                };
                            })
                        )
                    ).filter((item) => item !== null);

                    await connection.commit()
                    return res.status(200).json({
                        message: "Get Project successfully",
                        data: {
                            period: periodYear, projects: projects
                        }
                    })
                } catch (error) {
                    await connection.rollback()
                    return res.status(500).json({
                        message: error.message
                    })
                } finally {
                    connection.release()
                }
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        onlyOne: async (req, res, next) => {
            const projectId = req.params.projectId
            if (!projectId) return res.status(400).json({ message: "Invalid Parameter" })
            try {
                const connection = await PPIC.getConnection()
                try {
                    await connection.beginTransaction()
                    const project = await projectServices.get.onlyOne(projectId, connection)
                    const projectDetail = await projectDetailServices.get(projectId, connection)
                    const actual = await actualServices.get.all(projectId, connection)
                    const plans = await plansServices.get.all(projectId, connection)

                    await connection.commit()
                    const tempActual = actual.reduce((sum, item) => sum + parseFloat(item.AMOUNT), 0);
                    const tempPlans = parseFloat(plans[plans.length - 1]?.AMOUNT ?? 0)

                    return res.status(200).json({
                        message: "Get Project successfully",
                        data: [{
                            project,
                            projectDetail,
                            progress: {
                                PERCENTAGE: tempActual > 0 ? ((tempActual / parseFloat(projectDetail.CAPACITY)) * 100).toFixed(2) + "%" : "0%",
                                ACTUAL: `${new Intl.NumberFormat("id-ID").format(
                                    tempPlans
                                )} / ${new Intl.NumberFormat("id-ID").format(
                                    tempActual
                                )}`
                            }
                        }]
                    })
                } catch (error) {
                    await connection.rollback()
                    return res.status(500).json({
                        message: error.message
                    })
                } finally {
                    connection.release()
                }
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        summary: async (req, res, next) => {
            const companyId = req.params.companyId
            const year = req.query.y

            if (!companyId || !year) return res.status(400).json({ message: "Invalid Parameter" })

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
                const connection = await PPIC.getConnection()
                try {
                    await connection.beginTransaction()

                    const [periodYear] = await connection.query(othersQuerys.select.distinct.period.year, [companyId, companyId])

                    const categories = await categoryServices.get.all(companyId, connection)

                    const groupedProjects = await Promise.all(categories.map(async (category) => {
                        const periods = new Set();

                        const workLoad = await workLoadServices.get.onlyOne.byYear(category.ID, year, connection)

                        const projectsAtributes = await projectServices.get.byCategoryId(category.ID, connection)
                        const plansData = await Promise.all(projectsAtributes.map(async (project) => {
                            const plans = await plansServices.get.all(project.ID, connection)
                            return plans
                        }))
                        const actualData = await Promise.all(projectsAtributes.map(async (project) => {
                            const actual = await actualServices.get.all(project.ID, connection)
                            return actual
                        }))

                        plansData.flat().forEach((eachData) => {
                            const monthIndex = parseInt(eachData.PERIOD_MONTH.split("-")[0], 10) - 1;
                            if (monthIndex >= 0 && monthIndex < months.length && eachData.PERIOD_YEAR == year) {
                                periods.add(`${eachData.PERIOD_YEAR} / ${months[monthIndex]}`);
                            }
                        })

                        actualData.flat().forEach((eachData) => {
                            const monthIndex = parseInt(eachData.PERIOD_MONTH.split("-")[0], 10) - 1;
                            if (monthIndex >= 0 && monthIndex < months.length && eachData.PERIOD_YEAR == year) {
                                periods.add(`${eachData.PERIOD_YEAR} / ${months[monthIndex]}`);
                            }
                        })

                        const uniqueLabels = Array.from(periods).sort((a, b) => {
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
                            CATEGORY_ID: category.ID,
                            UOM: category.UOM,
                            WORK_LOAD: uniqueLabels.map((label) => {
                                return {
                                    x: label,
                                    y: workLoad.length > 0 ? workLoad[0].WORK_LOAD : null,
                                };
                            }),
                            PLANS: uniqueLabels.map((label) => {
                                const [year, month] = label.split(" / ");

                                const planItem = plansData.flat().filter(
                                    (item) => item.PERIOD_YEAR == year && months[parseInt(item.PERIOD_MONTH.split("-")[0], 10) - 1] === month
                                );

                                const totalAmount = planItem.reduce((total, item) => {
                                    return total + (parseInt(item.AMOUNT) || 0);
                                }, null);

                                return {
                                    x: label,
                                    y: totalAmount,
                                };
                            }),
                            ACTUAL: uniqueLabels.map((label) => {
                                const [year, month] = label.split(" / ");

                                const actualItem = actualData.flat().filter(
                                    (item) => item.PERIOD_YEAR == year && months[parseInt(item.PERIOD_MONTH.split("-")[0], 10) - 1] === month
                                );

                                const totalAmount = actualItem.reduce((total, item) => {
                                    return total + (parseInt(item.AMOUNT) || 0);
                                }, null);

                                return {
                                    x: label,
                                    y: totalAmount,
                                };
                            })
                        }
                    }))
                    await connection.commit()
                    return res.status(200).json({
                        message: "Get Project successfully",
                        data: {
                            period: periodYear,
                            data: groupedProjects
                        }
                    })
                } catch (error) {
                    await connection.rollback()
                    return res.status(500).json({
                        message: error.message
                    })
                } finally {
                    connection.release()
                }
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        download: {
            plans_and_actual: async (req, res) => {
                const { companyId, year } = req.params
                const { month_start, month_end } = req.query

                if (!companyId || !year || !month_start || !month_end) return res.status(400).json({ message: "Invalid Parameter" })
                try {
                    const CONNECTION = await PPIC.getConnection()
                    try {
                        const [actual] = await CONNECTION.query(othersQuerys.select.actual.by.period.month, [companyId, year, month_start, month_end])
                        const [plans] = await CONNECTION.query(othersQuerys.select.plan.by.period.month, [companyId, year, month_start, month_end])

                        const temp = new Map([...plans, ...actual].map(item => [item.PROJECT_ID + "|" + item.YEAR.toString() + "|" + item.MONTH, {
                            PROJECT_ID: item.PROJECT_ID,
                            PROJECT_NO: item.PROJECT_NO,
                            UOM: item.UOM,
                            CATEGORY: item.CATEGORY,
                            YEAR: item.YEAR,
                            MONTH: item.MONTH,
                        }]))

                        const pd = await Promise.all(Array.from(temp.values()).map(async p => {
                            const project = await projectServices.get.onlyOne(p.PROJECT_ID, CONNECTION)
                            const projectDetail = await projectDetailServices.get(p.PROJECT_ID, CONNECTION)
                            
                            return {
                                PROJECT_ID: p.PROJECT_ID,
                                ...project,
                                ...projectDetail
                            }
                        }))

                        const data = Array.from(temp.values()).map(p => {
                            return {
                                ...p,
                                ...pd.find(item => item.PROJECT_ID == p.PROJECT_ID),
                                TOTAL_AMOUNT_PLAN: plans.find(item => item.PROJECT_ID == p.PROJECT_ID && item.MONTH == p.MONTH)?.TOTAL_AMOUNT_PLAN ?? 0,
                                TOTAL_AMOUNT_ACTUAL: actual.find(item => item.PROJECT_ID == p.PROJECT_ID && item.MONTH == p.MONTH)?.TOTAL_AMOUNT_ACTUAL ?? 0,
                            }
                        })

                        res.status(200).json({
                            success: true,
                            message: "Successfully Get Data",
                            data: data
                        })
                    } catch (error) {
                        CONNECTION.rollback()
                        res.status(500).json({
                            message: error.message ?? "Internal server error"
                        })
                    } finally {
                        CONNECTION.release()
                    }
                } catch (error) {
                    res.status(500).json({
                        message: error.message ?? "Internal server error"
                    })
                }
            }
        }
    }
}

module.exports = {
    projectControllers
}