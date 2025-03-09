const { PPIC } = require("../config/db");
const { othersQuerys } = require("../models/others");
const { categoryServices } = require("../services/category");
const { projectServices } = require("../services/project");
const { actualServices } = require("../services/projectActual");
const { projectDetailServices } = require("../services/projectDetail");
const { plansServices } = require("../services/projectPlans");
const { workLoadServices } = require("../services/workLoad");

const projectControllers = {
    add: async (req, res, next) => {
        const { companyId, categoryId, projectNo, client, userId, name, description, ppm, capacity, workPlace, startDate, dueDate, finishDate } = req.body;
        if (!companyId || !categoryId || !projectNo || !client || !userId || !capacity || !workPlace || !startDate || !dueDate) return res.status(400).json({ message: "Invalid Parameter" })

        try {
            const connection = await PPIC.getConnection()
            try {
                await connection.beginTransaction()
                const id = await projectServices.add(companyId, categoryId, projectNo, client, userId)
                await projectDetailServices.add(id, userId, name, description, ppm, capacity, workPlace, startDate, dueDate, finishDate)
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
    edit: async (req, res, next) => {
        const { projectId, categoryId, projectNo, client, userId, name, description, ppm, capacity, workPlace, startDate, dueDate, finishDate } = req.body;
        if (!projectId || !categoryId || !projectNo || !client || !userId || !name || !capacity || !workPlace || !startDate || !dueDate || !finishDate) return res.status(400).json({ message: "Invalid Parameter" })

        try {
            const connection = await PPIC.getConnection()
            try {
                await connection.beginTransaction()
                await projectServices.edit(projectId, categoryId, projectNo, client, userId, connection)
                await projectDetailServices.edit(projectId, userId, name, description, ppm, capacity, workPlace, startDate, dueDate, finishDate, connection)
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
            const companyId = req.params.companyId
            if (!companyId) return res.status(400).json({ message: "Invalid Parameter" })
            try {
                const connection = await PPIC.getConnection()
                try {
                    await connection.beginTransaction()
                    const data = await projectServices.get.all(companyId)
                    const projects = await Promise.all(data.map(async (item) => {
                        const actual = await actualServices.get(item.ID, connection)
                        const plans = await plansServices.get(item.ID, connection)
                        
                        const tempActual = parseFloat(actual[actual.length - 1]?.AMOUNT ?? 0)
                        const tempPlans = parseFloat(plans[plans.length - 1]?.AMOUNT ?? 0)

                        return {
                            ...item,
                            progress: {
                                PERCENTAGE: tempPlans > 0 ? ((tempActual / item.CAPACITY) * 100).toFixed(2) + "%" : "0%",
                            }
                        }
                    }))
                    await connection.commit()
                    return res.status(200).json({
                        message: "Get Project successfully",
                        data: projects
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
                    const actual = await actualServices.get(projectId, connection)
                    const plans = await plansServices.get(projectId, connection)

                    await connection.commit()

                    const tempActual = parseFloat(actual[actual.length - 1]?.AMOUNT ?? 0)
                    const tempPlans = parseFloat(plans[plans.length - 1]?.AMOUNT ?? 0)

                    return res.status(200).json({
                        message: "Get Project successfully",
                        data: [{
                            project,
                            projectDetail,
                            progress: {
                                PERCENTAGE: tempPlans > 0 && tempActual > 0 ? ((tempActual / projectDetail.CAPACITY) * 100).toFixed(2) + "%" : "0%",
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

                    const categories = await categoryServices.get(companyId, connection)

                    const groupedProjects = await Promise.all(categories.map(async (category) => {
                        const periods = new Set();

                        const workLoad = await workLoadServices.get.onlyOne.byYear(category.ID, year, connection)

                        const projectsAtributes = await projectServices.get.byCategoryId(category.ID, connection)
                        const plansData = await Promise.all(projectsAtributes.map(async (project) => {
                            const plans = await plansServices.get(project.ID, connection)
                            return plans
                        }))
                        const actualData = await Promise.all(projectsAtributes.map(async (project) => {
                            const actual = await actualServices.get(project.ID, connection)
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
    }
}

module.exports = {
    projectControllers
}